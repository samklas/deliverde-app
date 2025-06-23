import { makeAutoObservable } from "mobx";

class UserStore {
  constructor() {
    makeAutoObservable(this);
  }

  _user = {
    dailyTotal: 0,
    dailyTarget: 0,
    streak: 0,
    avatarId: "",
  };

  get dailyTotal() {
    return this._user.dailyTotal;
  }

  setDailyTotal = (dailyTotal: number) => {
    this._user.dailyTotal = dailyTotal;
  };

  get dailyTarget() {
    return this._user.dailyTarget;
  }

  setDailyTarget = (dailyTarget: number) => {
    this._user.dailyTarget = dailyTarget;
  };

  get streak() {
    return this._user.streak;
  }

  setStreak = (streak: number) => {
    this._user.streak = streak;
  };

  get avatarId() {
    return this._user.avatarId;
  }

  setAvatarId = (avatarId: string) => {
    this._user.avatarId = avatarId;
  };
}

const userStore = new UserStore();
export default userStore;
