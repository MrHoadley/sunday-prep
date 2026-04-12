export type Unit = 'g' | 'kg' | 'ml' | 'l' | 'pcs' | 'cups' | 'tbsp' | 'tsp';

export type Category = 'Protein' | 'Grains' | 'Vegetables' | 'Fruits' | 'Dairy' | 'Fats' | 'Pantry' | 'Other';

export interface Ingredient {
  id: string;
  name: string;
  requiredAmount: number;
  unit: Unit;
  onHand: number;
  pricePerUnit: number;
  category?: Category;
  source?: string;
}

export interface DailyMeals {
  day: string;
  breakfast: string;
  lunch: string;
  dinner: string;
  snacks: string;
}

export interface MealPlan {
  calorieTarget: number;
  meals: DailyMeals[];
  ingredients: Ingredient[];
}
