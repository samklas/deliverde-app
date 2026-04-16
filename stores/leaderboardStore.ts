import { LeaderboardUser } from "@/types/users";
import { makeAutoObservable } from "mobx";

const initUsers: LeaderboardUser[] = [
  { uid: "", avatarId: "", username: "", points: 0 },
];

class LeaderboardStore {
  constructor() {
    makeAutoObservable(this);
  }

  _leaderboard = {
    users: initUsers,
  };

  get users() {
    return this._leaderboard.users;
  }

  setUsers = (users: LeaderboardUser[]) => {
    const sortedUsers = users.sort((a, b) => b.points - a.points);
    this._leaderboard.users = sortedUsers;
  };
}

const leaderboardStore = new LeaderboardStore();
export default leaderboardStore;
