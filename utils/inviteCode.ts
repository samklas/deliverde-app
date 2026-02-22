import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/firebaseConfig";

// Characters that are easy to read (removed confusing chars like 0, O, 1, I)
const INVITE_CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const INVITE_CODE_LENGTH = 6;

/**
 * Generate a random 6-character invite code
 */
export const generateInviteCode = (): string => {
  let code = "";
  for (let i = 0; i < INVITE_CODE_LENGTH; i++) {
    code += INVITE_CODE_CHARS.charAt(
      Math.floor(Math.random() * INVITE_CODE_CHARS.length)
    );
  }
  return code;
};

/**
 * Check if an invite code already exists in the users collection
 */
export const isUserInviteCodeUnique = async (code: string): Promise<boolean> => {
  const q = query(collection(db, "users"), where("inviteCode", "==", code));
  const snapshot = await getDocs(q);
  return snapshot.empty;
};

/**
 * Check if an invite code already exists in the groups collection
 */
export const isGroupInviteCodeUnique = async (code: string): Promise<boolean> => {
  const q = query(collection(db, "groups"), where("inviteCode", "==", code));
  const snapshot = await getDocs(q);
  return snapshot.empty;
};

/**
 * Generate a unique invite code for users (retry if exists)
 */
export const generateUniqueUserInviteCode = async (): Promise<string> => {
  let code = generateInviteCode();
  let attempts = 0;
  while (!(await isUserInviteCodeUnique(code)) && attempts < 10) {
    code = generateInviteCode();
    attempts++;
  }
  return code;
};

/**
 * Generate a unique invite code for groups (retry if exists)
 */
export const generateUniqueGroupInviteCode = async (): Promise<string> => {
  let code = generateInviteCode();
  let attempts = 0;
  while (!(await isGroupInviteCodeUnique(code)) && attempts < 10) {
    code = generateInviteCode();
    attempts++;
  }
  return code;
};

export const isCompetitionInviteCodeUnique = async (
  code: string
): Promise<boolean> => {
  const q = query(
    collection(db, "competitions"),
    where("inviteCode", "==", code)
  );
  const snapshot = await getDocs(q);
  return snapshot.empty;
};

export const generateUniqueCompetitionInviteCode =
  async (): Promise<string> => {
    let code = generateInviteCode();
    let attempts = 0;
    while (!(await isCompetitionInviteCodeUnique(code)) && attempts < 10) {
      code = generateInviteCode();
      attempts++;
    }
    return code;
  };
