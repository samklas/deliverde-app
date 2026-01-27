import Constants from "expo-constants";
import {
  readAsStringAsync,
  EncodingType,
} from "expo-file-system/legacy";
import { VegetableAnalysisResult } from "@/types/vision";

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
