export type GroupRole = "owner" | "admin" | "member";

export type Group = {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  createdBy: string;
  inviteCode: string;
  memberCount: number;
  memberUids: string[];
};

export type GroupMember = {
  uid: string;
  username: string;
  avatarId: string;
  role: GroupRole;
  joinedAt: Date;
};

export type GroupLeaderboard = {
  id: string;
  name: string;
  createdAt: Date;
  createdBy: string;
  isActive: boolean;
};

export type GroupLeaderboardEntry = {
  uid: string;
  username: string;
  avatarId: string;
  points: number;
  lastUpdated: Date;
};

export type GroupSummary = {
  id: string;
  name: string;
  memberCount: number;
  role: GroupRole;
  myPoints?: number;
};
