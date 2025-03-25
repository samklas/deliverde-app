import { makeAutoObservable } from "mobx";

class ChallengeStore {
  constructor() {
    makeAutoObservable(this);
  }

  _challenges = {
    dailyTotal: 0,
    dailyTarget: 0,
    streak: 0,
  };

  get dailyTotal() {
    return this._challenges.dailyTotal;
  }

  setDailyTotal = (dailyTotal: number) => {
    this._challenges.dailyTotal = dailyTotal;
  };

  get dailyTarget() {
    return this._challenges.dailyTarget;
  }

  setDailyTarget = (dailyTarget: number) => {
    this._challenges.dailyTarget = dailyTarget;
  };

  get streak() {
    return this._challenges.streak;
  }

  setStreak = (streak: number) => {
    this._challenges.streak = streak;
  };
}

const challengeStore = new ChallengeStore();
export default challengeStore;
