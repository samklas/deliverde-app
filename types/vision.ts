import { Vegetable } from "./vegetable";

export interface VegetableAnalysisResult {
  name: string;
  confidence: number;
  estimatedQuantity: number;
}

export interface MatchedVegetable {
  analysisResult: VegetableAnalysisResult;
  matchedVegetable: Vegetable | null;
  matchConfidence: number;
  selected: boolean;
  editedQuantity: number;
}

export type AnalysisState =
  | "idle"
  | "selecting"
  | "analyzing"
  | "results"
  | "error";
