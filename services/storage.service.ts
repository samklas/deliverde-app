import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS, StorageKey } from "@/constants";

export const storage = {
  async get(key: StorageKey): Promise<string | null> {
    return AsyncStorage.getItem(key);
  },

  async set(key: StorageKey, value: string): Promise<void> {
    await AsyncStorage.setItem(key, value);
  },

  async remove(key: StorageKey): Promise<void> {
    await AsyncStorage.removeItem(key);
  },

  async multiSet(items: [StorageKey, string][]): Promise<void> {
    await AsyncStorage.multiSet(items);
  },

  async multiRemove(keys: StorageKey[]): Promise<void> {
    await AsyncStorage.multiRemove(keys);
  },

  async clearUserData(): Promise<void> {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.USER_ID,
      STORAGE_KEYS.USERNAME,
      STORAGE_KEYS.DAILY_TOTAL,
      STORAGE_KEYS.VEGETABLES,
      STORAGE_KEYS.LAST_USED_VEGETABLES,
    ]);
  },
};
