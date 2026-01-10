export type Recipe = {
  id: string;
  created: string;
  imageUrl: string;
  title: string;
  ingredients: string[];
  instructions: string;
  details: Details;
  recipeOfMonth: boolean;
};

type Details = {
  duration: string;
  difficultyLevel: string;
  portionAmount: string;
};
