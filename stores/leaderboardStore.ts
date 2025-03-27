import { makeAutoObservable } from "mobx";

export type User = {
  id: string;
  name: string;
  totalScore: number;
};

// const initUser: User = {
//   id: "",
//   name: "",
//   totalScore: 0,
// };

const initUsers: User[] = [
  {
    id: "1",
    name: "Matti Virtanen",
    totalScore: Math.floor(Math.random() * 100),
  },
  {
    id: "2",
    name: "Liisa Korhonen",
    totalScore: Math.floor(Math.random() * 100),
  },
  { id: "3", name: "Jukka Niemi", totalScore: Math.floor(Math.random() * 100) },
  {
    id: "4",
    name: "Sanna Lahtinen",
    totalScore: Math.floor(Math.random() * 100),
  },
  {
    id: "5",
    name: "Kalle Rautio",
    totalScore: Math.floor(Math.random() * 100),
  },
  {
    id: "6",
    name: "Anna Salminen",
    totalScore: Math.floor(Math.random() * 100),
  },
  {
    id: "7",
    name: "Pekka Heikkinen",
    totalScore: Math.floor(Math.random() * 100),
  },
  {
    id: "8",
    name: "Tuula Hämäläinen",
    totalScore: Math.floor(Math.random() * 100),
  },
  {
    id: "9",
    name: "Mikael Ojala",
    totalScore: Math.floor(Math.random() * 100),
  },
  {
    id: "10",
    name: "Elina Kallio",
    totalScore: Math.floor(Math.random() * 100),
  },
];

class LeaderboardStore {
  constructor() {
    makeAutoObservable(this);
  }

  _leaderboard = {
    isVisible: false,
    users: initUsers.sort((a, b) => b.totalScore - a.totalScore), // todo: remove this sort
  };

  get isVisible() {
    return this._leaderboard.isVisible;
  }

  setIsVisible = (isVisible: boolean) => {
    this._leaderboard.isVisible = isVisible;
  };

  get users() {
    return this._leaderboard.users;
  }

  setUsers = (users: User[]) => {
    const sortedUsers = users.sort((a, b) => b.totalScore - a.totalScore);
    this._leaderboard.users = sortedUsers;
  };
}

const leaderboardStore = new LeaderboardStore();
export default leaderboardStore;
