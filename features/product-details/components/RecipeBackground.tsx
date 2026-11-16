"use client";

import type { Meal, FoodProfile } from "../types";
import { BookOpen, Globe2, Sparkles, Coffee } from "lucide-react";

interface RecipeBackgroundProps {
  recipe: Meal;
  foodProfile: FoodProfile;
}

export default function RecipeBackground({
  recipe,
  foodProfile
}: RecipeBackgroundProps) {
  return (
    <section className="details-section recipe-curiosity-section">
        <div className="details-section-heading">
          <span>FOOD BACKGROUND</span>
          <h2>{foodProfile.title}</h2>

          <p>
            Learn about the food traditions, ingredients and
            preparation that make {recipe.strMeal} special.
          </p>
        </div>

        <div className="recipe-curiosity-grid">
          <article className="recipe-curiosity-card">
            <div className="recipe-curiosity-icon">
              <BookOpen size={25} />
            </div>

            <h3>About This Dish</h3>
            <p>{foodProfile.background}</p>
          </article>

          <article className="recipe-curiosity-card">
            <div className="recipe-curiosity-icon">
              <Globe2 size={25} />
            </div>

            <h3>Origin & Famous Regions</h3>
            <p>{foodProfile.origin}</p>
          </article>

          <article className="recipe-curiosity-card">
            <div className="recipe-curiosity-icon">
              <Sparkles size={25} />
            </div>

            <h3>Flavour & Texture</h3>
            <p>{foodProfile.flavour}</p>
          </article>

          <article className="recipe-curiosity-card recipe-curiosity-highlight">
            <div className="recipe-curiosity-icon">
              <Coffee size={25} />
            </div>

            <h3>Food Culture</h3>
            <p>{foodProfile.culture}</p>
          </article>
        </div>
      </section>
  );
}
