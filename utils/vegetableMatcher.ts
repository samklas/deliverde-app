import { Vegetable } from "@/types/vegetable";

export interface MatchResult {
  vegetable: Vegetable | null;
  matchConfidence: number;
  originalName: string;
}

const normalizeString = (str: string): string => {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
    .trim();
};

const levenshteinDistance = (a: string, b: string): number => {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j] + 1 // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
};

const calculateSimilarity = (a: string, b: string): number => {
  const normalizedA = normalizeString(a);
  const normalizedB = normalizeString(b);

  if (normalizedA === normalizedB) {
    return 1;
  }

  // Check if one contains the other
  if (normalizedA.includes(normalizedB) || normalizedB.includes(normalizedA)) {
    return 0.9;
  }

  const maxLength = Math.max(normalizedA.length, normalizedB.length);
  if (maxLength === 0) return 1;

  const distance = levenshteinDistance(normalizedA, normalizedB);
  return 1 - distance / maxLength;
};

export const matchVegetableToDatabase = (
  aiName: string,
  dbVegetables: Vegetable[]
): MatchResult => {
  if (!aiName || dbVegetables.length === 0) {
    return {
      vegetable: null,
      matchConfidence: 0,
      originalName: aiName,
    };
  }

  let bestMatch: Vegetable | null = null;
  let bestConfidence = 0;

  for (const vegetable of dbVegetables) {
    const similarity = calculateSimilarity(aiName, vegetable.name);

    if (similarity > bestConfidence) {
      bestConfidence = similarity;
      bestMatch = vegetable;
    }
  }

  // Only return a match if confidence is above threshold
  const threshold = 0.6;
  if (bestConfidence >= threshold) {
    return {
      vegetable: bestMatch,
      matchConfidence: bestConfidence,
      originalName: aiName,
    };
  }

  return {
    vegetable: null,
    matchConfidence: bestConfidence,
    originalName: aiName,
  };
};

export const matchAllVegetables = (
  aiNames: string[],
  dbVegetables: Vegetable[]
): MatchResult[] => {
  return aiNames.map((name) => matchVegetableToDatabase(name, dbVegetables));
};
