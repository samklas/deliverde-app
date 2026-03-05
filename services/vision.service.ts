import Constants from "expo-constants";
import {
  readAsStringAsync,
  EncodingType,
} from "expo-file-system/legacy";
import { VegetableAnalysisResult } from "@/types/vision";
import { storage } from "./storage.service";
import { STORAGE_KEYS } from "@/constants";

const DAILY_ANALYSIS_LIMIT = 5;

type AnalysisUsage = { date: string; count: number };

const getTodayDate = () => new Date().toISOString().slice(0, 10);

export const getAnalysisUsage = async (): Promise<AnalysisUsage> => {
  const raw = await storage.get(STORAGE_KEYS.IMAGE_ANALYSIS_USAGE);
  if (raw) {
    const parsed: AnalysisUsage = JSON.parse(raw);
    if (parsed.date === getTodayDate()) return parsed;
  }
  return { date: getTodayDate(), count: 0 };
};

export const incrementAnalysisCount = async (): Promise<void> => {
  const usage = await getAnalysisUsage();
  await storage.set(
    STORAGE_KEYS.IMAGE_ANALYSIS_USAGE,
    JSON.stringify({ date: getTodayDate(), count: usage.count + 1 })
  );
};

export const getRemainingAnalyses = async (): Promise<number> => {
  const usage = await getAnalysisUsage();
  return Math.max(0, DAILY_ANALYSIS_LIMIT - usage.count);
};

const IMAGE_ANALYSIS_URL = Constants.expoConfig?.extra?.imageAnalysisUrl;

const convertImageToBase64 = async (uri: string): Promise<string> => {
  const base64 = await readAsStringAsync(uri, {
    encoding: EncodingType.Base64,
  });
  return base64;
};

export const analyzeVegetableImage = async (
  imageUri: string
): Promise<VegetableAnalysisResult[]> => {
  if (!IMAGE_ANALYSIS_URL) {
    throw new Error("Image analysis URL is not configured");
  }

  const base64Image = await convertImageToBase64(imageUri);

  const response = await fetch(IMAGE_ANALYSIS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ base64Image }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error("Image analysis error:", response.status, errorData);
    throw new Error(`Image analysis error: ${response.status}`);
  }

  const data = await response.json();
  return data.results ?? [];
};
