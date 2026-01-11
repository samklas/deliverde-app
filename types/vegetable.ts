export type Vegetable = {
  id: string;
  name: string;
  averageWeight: number;
};

export type TodayVegetable = {
  id: string;
  vegetableId: string;
  name: string;
  grams: number;
  addedAt: number;
};
