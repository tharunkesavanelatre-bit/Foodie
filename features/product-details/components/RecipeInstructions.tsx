"use client";

import type { Meal } from "../types";
import { BookOpen } from "lucide-react";

interface RecipeInstructionsProps {
  recipe: Meal;
}

export default function RecipeInstructions({
  recipe
}: RecipeInstructionsProps) {
  return (
    <section className="details-section original-preparation-section">
          <div className="details-section-heading">
            <span>RECIPE DETAILS</span>
            <h2>Original Preparation Notes</h2>
            <p>
              The preparation details provided for this dish.
            </p>
          </div>

          <div className="original-preparation-content">
            <BookOpen size={25} />
            <p>{recipe.strInstructions}</p>
          </div>
        </section>
  );
}
