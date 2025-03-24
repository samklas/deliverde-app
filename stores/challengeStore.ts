import { makeAutoObservable } from "mobx";

class ChallengeStore {
  constructor() {
    makeAutoObservable(this);
  }

  _challenges = {
    dailyTotal: 0,
  };

  get dailyTotal() {
    return this._challenges.dailyTotal;
  }

  setDailyTotal = (dailyTotal: number) => {
    this._challenges.dailyTotal = dailyTotal;
  };
}

const challengeStore = new ChallengeStore();
export default challengeStore;
