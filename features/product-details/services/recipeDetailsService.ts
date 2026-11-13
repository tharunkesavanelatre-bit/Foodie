import type { Meal, MealResponse } from "../types";

export async function getRecipeDetails(
  recipeId: string,
  signal?: AbortSignal
): Promise<Meal> {
  const response = await fetch(
    `/api/recipe/${encodeURIComponent(recipeId)}`,
    {
      cache: "no-store",
      signal,
    }
  );

  const data: MealResponse = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Unable to load recipe details."
    );
  }

  if (!Array.isArray(data.meals) || data.meals.length === 0) {
    throw new Error("Recipe not found.");
  }

  const recipe = data.meals[0];

  if (!recipe?.idMeal || !recipe?.strMeal) {
    throw new Error("Invalid recipe information received.");
  }

  return recipe;
}
