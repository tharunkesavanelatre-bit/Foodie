"use client";

import type { Meal } from "../types";

import { getFoodProfile } from "../utils/foodProfile";
import { getIngredients } from "../utils/ingredientHelper";

export function useRecipeInformation(recipe: Meal | null) {
  const foodProfile = recipe ? getFoodProfile(recipe) : null;
  const ingredients = recipe ? getIngredients(recipe) : [];

  const recipeTags = recipe?.strTags
    ? recipe.strTags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
    : [];

  return {
    foodProfile,
    ingredients,
    recipeTags,
  };
}
