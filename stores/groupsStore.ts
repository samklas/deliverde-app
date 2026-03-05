import { makeAutoObservable } from "mobx";
import { GroupSummary, GroupLeaderboardEntry } from "@/types/groups";

class GroupsStore {
  constructor() {
    makeAutoObservable(this);
  }

  _groups: GroupSummary[] = [];
  _isLoading = false;

  get groups() {
    return this._groups;
  }

  get isLoading() {
    return this._isLoading;
  }

  setGroups = (groups: GroupSummary[]) => {
    this._groups = groups;
  };

  setIsLoading = (isLoading: boolean) => {
    this._isLoading = isLoading;
  };

  addGroup = (group: GroupSummary) => {
    this._groups = [...this._groups, group];
  };

  removeGroup = (groupId: string) => {
    this._groups = this._groups.filter((g) => g.id !== groupId);
  };

  updateGroup = (groupId: string, updates: Partial<GroupSummary>) => {
    this._groups = this._groups.map((g) =>
      g.id === groupId ? { ...g, ...updates } : g
    );
  };

  clearGroups = () => {
    this._groups = [];
  };
}

const groupsStore = new GroupsStore();
export default groupsStore;
