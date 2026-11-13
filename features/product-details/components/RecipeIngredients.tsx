"use client";

import type { Meal, Ingredient } from "../types";
import { Leaf, Info } from "lucide-react";

interface RecipeIngredientsProps {
  recipe: Meal;
  ingredients: Ingredient[];
}

export default function RecipeIngredients({
  recipe,
  ingredients
}: RecipeIngredientsProps) {
  return (
    <section className="details-section recipe-ingredients-section">
        <div className="details-section-heading">
          <span>WHAT GOES INTO IT</span>
          <h2>Ingredients Behind the Dish</h2>

          <p>
            Take a closer look at the ingredients that give
            {` ${recipe.strMeal} `}its flavour, aroma and character.
          </p>
        </div>

        {ingredients.length > 0 ? (
          <div className="ingredients-grid">
            {ingredients.map((ingredient, index) => (
              <article
                className="ingredient-card"
                key={`${ingredient.name}-${index}`}
              >
                <div className="ingredient-number">
                  {String(index + 1).padStart(2, "0")}
                </div>

                <div className="ingredient-content">
                  <h3>{ingredient.name}</h3>

                  {ingredient.measure && (
                    <p>{ingredient.measure}</p>
                  )}
                </div>

                <Leaf
                  size={20}
                  className="ingredient-icon"
                />
              </article>
            ))}
          </div>
        ) : (
          <div className="recipe-curiosity-note">
            <Info size={20} />
            <p>
              Ingredient information is not available for this dish.
            </p>
          </div>
        )}
      </section>
  );
}
