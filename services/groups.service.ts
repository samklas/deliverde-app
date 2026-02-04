import { auth, db } from "@/firebaseConfig";
import {
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  arrayUnion,
  arrayRemove,
  increment,
  writeBatch,
  Timestamp,
} from "firebase/firestore";
import {
  Group,
  GroupMember,
  GroupLeaderboard,
  GroupLeaderboardEntry,
  GroupSummary,
} from "@/types/groups";
import { generateUniqueGroupInviteCode } from "@/utils/inviteCode";
import { MAX_USER_GROUPS, MAX_GROUP_MEMBERS } from "@/constants";

/**
 * Get current user's UID or throw if not authenticated
 */
const getCurrentUid = (): string => {
  const uid = auth.currentUser?.uid;
  if (!uid) {
    throw new Error("User is not authenticated");
  }
  return uid;
};

/**
 * Get current user's profile data
 */
const getCurrentUserProfile = async (): Promise<{ username: string; avatarId: string }> => {
  const uid = getCurrentUid();
  const userDoc = await getDoc(doc(db, "users", uid));
  const userData = userDoc.data();
  if (!userData) {
    throw new Error("User profile not found");
  }
  return {
    username: userData.username || "Unknown",
    avatarId: userData.avatarId || "",
  };
};

/**
 * Create a new group with a default leaderboard
 */
export const createGroup = async (
  name: string,
  description?: string
): Promise<string> => {
  const uid = getCurrentUid();
  const userProfile = await getCurrentUserProfile();

  // Check user's current group count
  const userDoc = await getDoc(doc(db, "users", uid));
  const userData = userDoc.data();
  const currentGroupIds = userData?.groupIds || [];

  if (currentGroupIds.length >= MAX_USER_GROUPS) {
    throw new Error(`Voit olla jäsenenä enintään ${MAX_USER_GROUPS} ryhmässä`);
  }

  const inviteCode = await generateUniqueGroupInviteCode();
  const groupRef = doc(collection(db, "groups"));
  const groupId = groupRef.id;
  const now = Timestamp.now();

  const groupData: Omit<Group, "id"> = {
    name,
    description: description || "",
    createdAt: now.toDate(),
    createdBy: uid,
    inviteCode,
    memberCount: 1,
    memberUids: [uid],
  };

  const memberData: GroupMember = {
    uid,
    username: userProfile.username,
    avatarId: userProfile.avatarId,
    role: "owner",
    joinedAt: now.toDate(),
  };

  // Create default leaderboard
  const leaderboardRef = doc(collection(db, "groups", groupId, "leaderboards"));
  const leaderboardData: Omit<GroupLeaderboard, "id"> = {
    name: "Tulostaulu",
    createdAt: now.toDate(),
    createdBy: uid,
    isActive: true,
  };

  const entryData: GroupLeaderboardEntry = {
    uid,
    username: userProfile.username,
    avatarId: userProfile.avatarId,
    points: 0,
    lastUpdated: now.toDate(),
  };

  const batch = writeBatch(db);

  // Create the group document
  batch.set(groupRef, {
    ...groupData,
    createdAt: now,
  });

  // Add the creator as a member
  batch.set(doc(db, "groups", groupId, "members", uid), {
    ...memberData,
    joinedAt: now,
  });

  // Create the default leaderboard
  batch.set(leaderboardRef, {
    ...leaderboardData,
    createdAt: now,
  });

  // Add creator as first leaderboard entry
  batch.set(
    doc(db, "groups", groupId, "leaderboards", leaderboardRef.id, "entries", uid),
    { ...entryData, lastUpdated: now }
  );

  // Add groupId to user's document
  batch.update(doc(db, "users", uid), {
    groupIds: arrayUnion(groupId),
  });

  await batch.commit();

  return groupId;
};

/**
 * Join a group using an invite code
 */
export const joinGroup = async (inviteCode: string): Promise<string> => {
  const uid = getCurrentUid();
  const userProfile = await getCurrentUserProfile();

  // Check user's current group count
  const userDoc = await getDoc(doc(db, "users", uid));
  const userData = userDoc.data();
  const currentGroupIds = userData?.groupIds || [];

  if (currentGroupIds.length >= MAX_USER_GROUPS) {
    throw new Error(`Voit olla jäsenenä enintään ${MAX_USER_GROUPS} ryhmässä`);
  }

  // Find the group by invite code
  const groupsQuery = query(
    collection(db, "groups"),
    where("inviteCode", "==", inviteCode.toUpperCase())
  );
  const groupsSnapshot = await getDocs(groupsQuery);

  if (groupsSnapshot.empty) {
    throw new Error("Ryhmää ei löytynyt tällä koodilla");
  }

  const groupDoc = groupsSnapshot.docs[0];
  const groupId = groupDoc.id;
  const groupData = groupDoc.data() as Group;

  // Check if user is already a member
  if (groupData.memberUids.includes(uid)) {
    throw new Error("Olet jo tämän ryhmän jäsen");
  }

  // Check group member limit
  if (groupData.memberCount >= MAX_GROUP_MEMBERS) {
    throw new Error(`Ryhmä on täynnä (max ${MAX_GROUP_MEMBERS} jäsentä)`);
  }

  const now = Timestamp.now();
  const memberData: GroupMember = {
    uid,
    username: userProfile.username,
    avatarId: userProfile.avatarId,
    role: "member",
    joinedAt: now.toDate(),
  };

  const batch = writeBatch(db);

  // Add member to group
  batch.set(doc(db, "groups", groupId, "members", uid), {
    ...memberData,
    joinedAt: now,
  });

  // Update group's member list and count
  batch.update(doc(db, "groups", groupId), {
    memberUids: arrayUnion(uid),
    memberCount: increment(1),
  });

  // Add groupId to user's document
  batch.update(doc(db, "users", uid), {
    groupIds: arrayUnion(groupId),
  });

  // Add user to the group's leaderboard
  const leaderboardsSnapshot = await getDocs(
    collection(db, "groups", groupId, "leaderboards")
  );

  for (const leaderboardDoc of leaderboardsSnapshot.docs) {
    const entryData: GroupLeaderboardEntry = {
      uid,
      username: userProfile.username,
      avatarId: userProfile.avatarId,
      points: 0,
      lastUpdated: now.toDate(),
    };
    batch.set(
      doc(db, "groups", groupId, "leaderboards", leaderboardDoc.id, "entries", uid),
      { ...entryData, lastUpdated: now }
    );
  }

  await batch.commit();

  return groupId;
};

/**
 * Leave a group
 */
export const leaveGroup = async (groupId: string): Promise<void> => {
  const uid = getCurrentUid();

  const groupRef = doc(db, "groups", groupId);
  const groupDoc = await getDoc(groupRef);

  if (!groupDoc.exists()) {
    throw new Error("Ryhmää ei löytynyt");
  }

  const groupData = groupDoc.data() as Group;

  // Check if user is the owner
  if (groupData.createdBy === uid) {
    throw new Error("Omistaja ei voi poistua ryhmästä. Poista ryhmä sen sijaan.");
  }

  const batch = writeBatch(db);

  // Remove member from group
  batch.delete(doc(db, "groups", groupId, "members", uid));

  // Update group's member list and count
  batch.update(groupRef, {
    memberUids: arrayRemove(uid),
    memberCount: increment(-1),
  });

  // Remove groupId from user's document
  batch.update(doc(db, "users", uid), {
    groupIds: arrayRemove(groupId),
  });

  // Remove user from leaderboard entries
  const leaderboardsSnapshot = await getDocs(
    collection(db, "groups", groupId, "leaderboards")
  );

  for (const leaderboardDoc of leaderboardsSnapshot.docs) {
    batch.delete(
      doc(db, "groups", groupId, "leaderboards", leaderboardDoc.id, "entries", uid)
    );
  }

  await batch.commit();
};

/**
 * Delete a group (owner only)
 */
export const deleteGroup = async (groupId: string): Promise<void> => {
  const uid = getCurrentUid();

  const groupRef = doc(db, "groups", groupId);
  const groupDoc = await getDoc(groupRef);

  if (!groupDoc.exists()) {
    throw new Error("Ryhmää ei löytynyt");
  }

  const groupData = groupDoc.data() as Group;

  if (groupData.createdBy !== uid) {
    throw new Error("Vain ryhmän omistaja voi poistaa ryhmän");
  }

  const batch = writeBatch(db);

  // Remove groupId from all members' user documents
  for (const memberUid of groupData.memberUids) {
    batch.update(doc(db, "users", memberUid), {
      groupIds: arrayRemove(groupId),
    });
  }

  // Delete all members
  const membersSnapshot = await getDocs(
    collection(db, "groups", groupId, "members")
  );
  for (const memberDoc of membersSnapshot.docs) {
    batch.delete(memberDoc.ref);
  }

  // Delete leaderboard and its entries
  const leaderboardsSnapshot = await getDocs(
    collection(db, "groups", groupId, "leaderboards")
  );
  for (const leaderboardDoc of leaderboardsSnapshot.docs) {
    const entriesSnapshot = await getDocs(
      collection(db, "groups", groupId, "leaderboards", leaderboardDoc.id, "entries")
    );
    for (const entryDoc of entriesSnapshot.docs) {
      batch.delete(entryDoc.ref);
    }
    batch.delete(leaderboardDoc.ref);
  }

  // Delete the group
  batch.delete(groupRef);

  await batch.commit();
};

/**
 * Get all groups the current user is a member of
 */
export const getUserGroups = async (): Promise<GroupSummary[]> => {
  const uid = getCurrentUid();

  const userDoc = await getDoc(doc(db, "users", uid));
  const userData = userDoc.data();
  const groupIds: string[] = userData?.groupIds || [];

  if (groupIds.length === 0) {
    return [];
  }

  const groups: GroupSummary[] = [];

  for (const groupId of groupIds) {
    const groupDoc = await getDoc(doc(db, "groups", groupId));
    if (groupDoc.exists()) {
      const groupData = groupDoc.data() as Group;
      const memberDoc = await getDoc(doc(db, "groups", groupId, "members", uid));
      const memberData = memberDoc.data() as GroupMember | undefined;

      groups.push({
        id: groupId,
        name: groupData.name,
        memberCount: groupData.memberCount,
        role: memberData?.role || "member",
      });
    }
  }

  return groups;
};

/**
 * Get detailed group information
 */
export const getGroup = async (groupId: string): Promise<Group | null> => {
  const groupDoc = await getDoc(doc(db, "groups", groupId));
  if (!groupDoc.exists()) {
    return null;
  }

  const data = groupDoc.data();
  return {
    id: groupId,
    name: data.name,
    description: data.description,
    createdAt: data.createdAt?.toDate() || new Date(),
    createdBy: data.createdBy,
    inviteCode: data.inviteCode,
    memberCount: data.memberCount,
    memberUids: data.memberUids,
  };
};

/**
 * Get all members of a group
 */
export const getGroupMembers = async (groupId: string): Promise<GroupMember[]> => {
  const membersSnapshot = await getDocs(
    collection(db, "groups", groupId, "members")
  );

  return membersSnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      uid: data.uid,
      username: data.username,
      avatarId: data.avatarId,
      role: data.role,
      joinedAt: data.joinedAt?.toDate() || new Date(),
    };
  });
};

/**
 * Get the group's leaderboard
 */
export const getGroupLeaderboard = async (
  groupId: string
): Promise<GroupLeaderboard | null> => {
  const leaderboardsSnapshot = await getDocs(
    collection(db, "groups", groupId, "leaderboards")
  );

  if (leaderboardsSnapshot.empty) {
    return null;
  }

  const doc = leaderboardsSnapshot.docs[0];
  const data = doc.data();
  return {
    id: doc.id,
    name: data.name,
    createdAt: data.createdAt?.toDate() || new Date(),
    createdBy: data.createdBy,
    isActive: data.isActive,
  };
};

/**
 * Get all entries in a group's leaderboard
 */
export const getGroupLeaderboardEntries = async (
  groupId: string,
  leaderboardId: string
): Promise<GroupLeaderboardEntry[]> => {
  const entriesSnapshot = await getDocs(
    collection(db, "groups", groupId, "leaderboards", leaderboardId, "entries")
  );

  const entries = entriesSnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      uid: data.uid,
      username: data.username,
      avatarId: data.avatarId,
      points: data.points,
      lastUpdated: data.lastUpdated?.toDate() || new Date(),
    };
  });

  // Sort by points descending
  return entries.sort((a, b) => b.points - a.points);
};

/**
 * Update points for the current user in all their group leaderboards
 * Called when logging vegetables
 */
export const updateAllGroupLeaderboards = async (
  pointsToAdd: number
): Promise<void> => {
  const uid = getCurrentUid();

  const userDoc = await getDoc(doc(db, "users", uid));
  const userData = userDoc.data();
  const groupIds: string[] = userData?.groupIds || [];

  if (groupIds.length === 0 || pointsToAdd <= 0) {
    return;
  }

  const batch = writeBatch(db);
  const now = Timestamp.now();

  for (const groupId of groupIds) {
    // Get the leaderboard in the group
    const leaderboardsSnapshot = await getDocs(
      collection(db, "groups", groupId, "leaderboards")
    );

    for (const leaderboardDoc of leaderboardsSnapshot.docs) {
      const entryRef = doc(
        db,
        "groups",
        groupId,
        "leaderboards",
        leaderboardDoc.id,
        "entries",
        uid
      );

      batch.update(entryRef, {
        points: increment(pointsToAdd),
        lastUpdated: now,
      });
    }
  }

  await batch.commit();
};
