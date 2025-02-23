export type Recipe = {
  id: string;
  created: string;
  imageUrl: string;
  title: string;
  ingredients: string[];
  instructions: string;
  details: Details;
};

type Details = {
  duration: string;
  difficultyLevel: string;
  portionaAmount: string;
};
