export const STORAGE_KEYS = {
  USER_ID: "id",
  USERNAME: "username",
  DAILY_TOTAL: "dailyTotal",
  VEGETABLES: "vegetables",
  LAST_USED_VEGETABLES: "lastUsedVegetables",
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
