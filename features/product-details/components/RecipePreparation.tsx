"use client";

import type { Meal, FoodProfile } from "../types";
import { CookingPot, Flame } from "lucide-react";

interface RecipePreparationProps {
  recipe: Meal;
  foodProfile: FoodProfile;
}

export default function RecipePreparation({
  recipe,
  foodProfile
}: RecipePreparationProps) {
  return (
    <section className="details-section preparation-section">
        <div className="details-section-heading">
          <span>BEHIND THE PREPARATION</span>
          <h2>How This Dish Comes Together</h2>

          <p>
            See how the ingredients are prepared, combined and
            cooked to create {recipe.strMeal}.
          </p>
        </div>

        <div className="preparation-overview-card">
          <div className="preparation-overview-icon">
            <CookingPot size={30} />
          </div>

          <div>
            <span>PREPARATION OVERVIEW</span>
            <h3>{recipe.strMeal}</h3>
            <p>{foodProfile.preparation}</p>
          </div>
        </div>

        <div className="preparation-method-card">
          <div className="preparation-method-icon">
            <Flame size={23} />
          </div>

          <div>
            <span>COOKING STYLE</span>
            <h3>{foodProfile.cookingMethod}</h3>
          </div>
        </div>

        <div className="preparation-stages">
          {foodProfile.stages.map((stage, index) => (
            <article
              className="preparation-stage-card"
              key={`${stage}-${index}`}
            >
              <div className="preparation-stage-number">
                {String(index + 1).padStart(2, "0")}
              </div>

              <div className="preparation-stage-content">
                <span>
                  PREPARATION STAGE {index + 1}
                </span>

                <p>{stage}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
  );
}
