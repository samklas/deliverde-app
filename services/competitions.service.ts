import { auth, db } from "@/firebaseConfig";
import {
  doc,
  getDoc,
  getDocs,
  deleteDoc,
  collection,
  query,
  where,
  arrayUnion,
  arrayRemove,
  writeBatch,
  Timestamp,
} from "firebase/firestore";
import {
  Competition,
  CompetitionGroup,
  CompetitionGroupRanking,
  CompetitionSummary,
} from "@/types/competitions";
import { generateUniqueCompetitionInviteCode } from "@/utils/inviteCode";
import {
  MAX_GROUPS_PER_COMPETITION,
  MAX_COMPETITIONS_PER_GROUP,
} from "@/constants";

const getCurrentUid = (): string => {
  const uid = auth.currentUser?.uid;
  if (!uid) {
    throw new Error("User is not authenticated");
  }
  return uid;
};

/**
 * Validate that the current user is the owner of the given group
 */
const validateGroupOwnership = async (groupId: string): Promise<void> => {
  const uid = getCurrentUid();
  const memberDoc = await getDoc(
    doc(db, "groups", groupId, "members", uid)
  );
  if (!memberDoc.exists() || memberDoc.data().role !== "owner") {
    throw new Error("Vain ryhmän omistaja voi hallita kilpailuja");
  }
};

/**
 * Create a new competition with the creator's group as the first participant
 */
export const createCompetition = async (
  name: string,
  description: string | undefined,
  groupId: string
): Promise<string> => {
  const uid = getCurrentUid();
  await validateGroupOwnership(groupId);

  // Check competition limit for this group
  const existingCompetitions = await getCompetitionsForGroup(groupId);
  if (existingCompetitions.length >= MAX_COMPETITIONS_PER_GROUP) {
    throw new Error(
      `Ryhmä voi osallistua enintään ${MAX_COMPETITIONS_PER_GROUP} kilpailuun`
    );
  }

  // Get group name for denormalization
  const groupDoc = await getDoc(doc(db, "groups", groupId));
  if (!groupDoc.exists()) {
    throw new Error("Ryhmää ei löytynyt");
  }
  const groupName = groupDoc.data().name;

  const inviteCode = await generateUniqueCompetitionInviteCode();
  const competitionRef = doc(collection(db, "competitions"));
  const competitionId = competitionRef.id;
  const now = Timestamp.now();

  const batch = writeBatch(db);

  // Create competition document
  batch.set(competitionRef, {
    name,
    description: description || "",
    createdAt: now,
    createdBy: uid,
    inviteCode,
    groupIds: [groupId],
    status: "active",
  });

  // Add first group subdoc
  batch.set(
    doc(db, "competitions", competitionId, "groups", groupId),
    {
      groupId,
      groupName,
      joinedAt: now,
      addedBy: uid,
    }
  );

  await batch.commit();

  return competitionId;
};

/**
 * Join a competition using an invite code
 */
export const joinCompetition = async (
  inviteCode: string,
  groupId: string
): Promise<string> => {
  const uid = getCurrentUid();
  await validateGroupOwnership(groupId);

  // Check competition limit for this group
  const existingCompetitions = await getCompetitionsForGroup(groupId);
  if (existingCompetitions.length >= MAX_COMPETITIONS_PER_GROUP) {
    throw new Error(
      `Ryhmä voi osallistua enintään ${MAX_COMPETITIONS_PER_GROUP} kilpailuun`
    );
  }

  // Find competition by invite code
  const competitionsQuery = query(
    collection(db, "competitions"),
    where("inviteCode", "==", inviteCode.toUpperCase())
  );
  const competitionsSnapshot = await getDocs(competitionsQuery);

  if (competitionsSnapshot.empty) {
    throw new Error("Kilpailua ei löytynyt tällä koodilla");
  }

  const competitionDoc = competitionsSnapshot.docs[0];
  const competitionId = competitionDoc.id;
  const competitionData = competitionDoc.data() as Competition;

  // Check if group is already in competition
  if (competitionData.groupIds.includes(groupId)) {
    throw new Error("Ryhmä on jo tässä kilpailussa");
  }

  // Check group limit
  if (competitionData.groupIds.length >= MAX_GROUPS_PER_COMPETITION) {
    throw new Error(
      `Kilpailu on täynnä (max ${MAX_GROUPS_PER_COMPETITION} ryhmää)`
    );
  }

  // Get group name for denormalization
  const groupDoc = await getDoc(doc(db, "groups", groupId));
  if (!groupDoc.exists()) {
    throw new Error("Ryhmää ei löytynyt");
  }
  const groupName = groupDoc.data().name;

  const now = Timestamp.now();
  const batch = writeBatch(db);

  // Add group to competition's groupIds array
  batch.update(doc(db, "competitions", competitionId), {
    groupIds: arrayUnion(groupId),
  });

  // Add group subdoc
  batch.set(
    doc(db, "competitions", competitionId, "groups", groupId),
    {
      groupId,
      groupName,
      joinedAt: now,
      addedBy: uid,
    }
  );

  await batch.commit();

  return competitionId;
};

/**
 * Remove a group from a competition; delete competition if last group
 */
export const leaveCompetition = async (
  competitionId: string,
  groupId: string
): Promise<void> => {
  await validateGroupOwnership(groupId);

  const competitionRef = doc(db, "competitions", competitionId);
  const competitionDoc = await getDoc(competitionRef);

  if (!competitionDoc.exists()) {
    throw new Error("Kilpailua ei löytynyt");
  }

  const competitionData = competitionDoc.data() as Competition;

  if (!competitionData.groupIds.includes(groupId)) {
    throw new Error("Ryhmä ei ole tässä kilpailussa");
  }

  // If this is the last group, delete the whole competition
  if (competitionData.groupIds.length <= 1) {
    await deleteCompetition(competitionId);
    return;
  }

  const batch = writeBatch(db);

  // Remove group from groupIds array
  batch.update(competitionRef, {
    groupIds: arrayRemove(groupId),
  });

  // Delete group subdoc
  batch.delete(
    doc(db, "competitions", competitionId, "groups", groupId)
  );

  await batch.commit();
};

/**
 * Delete a competition (creator only)
 */
export const deleteCompetition = async (
  competitionId: string
): Promise<void> => {
  const uid = getCurrentUid();

  const competitionRef = doc(db, "competitions", competitionId);
  const competitionDoc = await getDoc(competitionRef);

  if (!competitionDoc.exists()) {
    throw new Error("Kilpailua ei löytynyt");
  }

  const competitionData = competitionDoc.data() as Competition;

  if (competitionData.createdBy !== uid) {
    throw new Error("Vain kilpailun luoja voi poistaa kilpailun");
  }

  const batch = writeBatch(db);

  // Delete all group subdocs
  const groupsSnapshot = await getDocs(
    collection(db, "competitions", competitionId, "groups")
  );
  for (const groupDoc of groupsSnapshot.docs) {
    batch.delete(groupDoc.ref);
  }

  // Delete competition
  batch.delete(competitionRef);

  await batch.commit();
};

/**
 * Get all competitions for a specific group
 */
export const getCompetitionsForGroup = async (
  groupId: string
): Promise<CompetitionSummary[]> => {
  const competitionsQuery = query(
    collection(db, "competitions"),
    where("groupIds", "array-contains", groupId)
  );
  const snapshot = await getDocs(competitionsQuery);

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.name,
      status: data.status,
      groupCount: data.groupIds?.length || 0,
      myGroupId: groupId,
    };
  });
};

/**
 * Get a single competition by ID
 */
export const getCompetition = async (
  competitionId: string
): Promise<Competition | null> => {
  const competitionDoc = await getDoc(
    doc(db, "competitions", competitionId)
  );
  if (!competitionDoc.exists()) {
    return null;
  }

  const data = competitionDoc.data();
  return {
    id: competitionId,
    name: data.name,
    description: data.description,
    createdAt: data.createdAt?.toDate() || new Date(),
    createdBy: data.createdBy,
    inviteCode: data.inviteCode,
    groupIds: data.groupIds || [],
    status: data.status,
  };
};

/**
 * Get all groups in a competition's subcollection
 */
export const getCompetitionGroups = async (
  competitionId: string
): Promise<CompetitionGroup[]> => {
  const groupsSnapshot = await getDocs(
    collection(db, "competitions", competitionId, "groups")
  );

  return groupsSnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      groupId: data.groupId,
      groupName: data.groupName,
      joinedAt: data.joinedAt?.toDate() || new Date(),
      addedBy: data.addedBy,
    };
  });
};

/**
 * Get competition rankings — compute average points per group member
 */
export const getCompetitionRankings = async (
  competitionId: string,
  myGroupIds: string[]
): Promise<CompetitionGroupRanking[]> => {
  const competitionGroups = await getCompetitionGroups(competitionId);
  const rankings: CompetitionGroupRanking[] = [];

  for (const group of competitionGroups) {
    // Fetch group's leaderboard entries
    const leaderboardsSnapshot = await getDocs(
      collection(db, "groups", group.groupId, "leaderboards")
    );

    let totalPoints = 0;
    let memberCount = 0;

    if (!leaderboardsSnapshot.empty) {
      const leaderboardId = leaderboardsSnapshot.docs[0].id;
      const entriesSnapshot = await getDocs(
        collection(
          db,
          "groups",
          group.groupId,
          "leaderboards",
          leaderboardId,
          "entries"
        )
      );

      memberCount = entriesSnapshot.size;
      entriesSnapshot.docs.forEach((doc) => {
        totalPoints += doc.data().points || 0;
      });
    }

    const averagePoints =
      memberCount > 0 ? Math.round((totalPoints / memberCount) * 10) / 10 : 0;

    rankings.push({
      groupId: group.groupId,
      groupName: group.groupName,
      averagePoints,
      memberCount,
      myGroup: myGroupIds.includes(group.groupId),
    });
  }

  // Sort by average points descending
  rankings.sort((a, b) => b.averagePoints - a.averagePoints);

  return rankings;
};
