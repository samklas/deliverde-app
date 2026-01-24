export const STORAGE_KEYS = {
  USER_ID: "id",
  USERNAME: "username",
  DAILY_TOTAL: "dailyTotal",
  VEGETABLES: "vegetables",
  LAST_USED_VEGETABLES: "lastUsedVegetables",
  ONBOARDING_USERNAME: "onboarding_username",
  ONBOARDING_AVATAR: "onboarding_avatar",
  ONBOARDING_EMAIL: "onboarding_email",
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
