import { makeAutoObservable } from "mobx";

class LeaderboardStore {
  constructor() {
    makeAutoObservable(this);
  }

  _leaderboard = {
    isVisible: false,
  };

  get isVisible() {
    return this._leaderboard.isVisible;
  }

  setIsVisible = (isVisible: boolean) => {
    this._leaderboard.isVisible = isVisible;
  };
}

const leaderboardStore = new LeaderboardStore();
export default leaderboardStore;
