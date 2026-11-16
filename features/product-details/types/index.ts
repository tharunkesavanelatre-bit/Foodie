// ==========================================

export interface Meal {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
  strCategory: string;
  strArea: string;
  strInstructions: string;
  strTags: string | null;
  strYoutube: string | null;
  [key: string]: string | null;
}

export interface MealResponse {
  meals: Meal[] | null;
  message?: string;
}

export interface CartItem {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
  price?: number;
  quantity: number;
}

export interface WishlistItem {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
  price?: number;
}

export interface FoodProfile {
  title: string;
  origin: string;
  background: string;
  preparation: string;
  ingredients: string;
  stages: string[];
  flavour: string;
  culture: string;
  cookingMethod: string;
}

export interface Ingredient {
  name: string;
  measure: string;
}

// ==========================================
