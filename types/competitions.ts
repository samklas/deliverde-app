export type Competition = {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  createdBy: string;
  inviteCode: string;
  groupIds: string[];
  status: "active";
};

export type CompetitionGroup = {
  groupId: string;
  groupName: string;
  joinedAt: Date;
  addedBy: string;
};

export type CompetitionGroupRanking = {
  groupId: string;
  groupName: string;
  averagePoints: number;
  memberCount: number;
  myGroup: boolean;
};

export type CompetitionSummary = {
  id: string;
  name: string;
  status: "active";
  groupCount: number;
  myGroupId: string;
};
