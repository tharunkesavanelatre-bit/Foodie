import type { Meal, Ingredient } from "../types";

export function getIngredients(recipe: Meal): Ingredient[] {
  const ingredients: Ingredient[] = [];

  for (let i = 1; i <= 20; i++) {
    const name = recipe[`strIngredient${i}`]?.trim();
    const measure = recipe[`strMeasure${i}`]?.trim();

    if (name) {
      ingredients.push({
        name,
        measure: measure || "",
      });
    }
  }

  return ingredients;
}

// ==========================================
