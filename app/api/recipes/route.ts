import { NextResponse } from "next/server";

// ==========================================
// TYPES
// ==========================================

interface Meal {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
  strCategory: string;
  strArea: string;
}

interface MealResponse {
  meals: Meal[] | null;
}

// ==========================================
// THEMEALDB API
// ==========================================

const API_URL = "https://www.themealdb.com/api/json/v1/1";

// ==========================================
// GET ALL RECIPES
// ==========================================

export async function GET() {
  try {
    const letters = "abcdefghijklmnopqrstuvwxyz".split("");

    const allMeals: Meal[] = [];

    // Fetch recipes in batches of five letters.
    for (let i = 0; i < letters.length; i += 5) {
      const batch = letters.slice(i, i + 5);

      const responses = await Promise.all(
        batch.map(async (letter) => {
          const response = await fetch(
            `${API_URL}/search.php?f=${letter}`,
            {
              next: { revalidate: 3600 },
              signal: AbortSignal.timeout(20000),
            }
          );

          if (!response.ok) {
            throw new Error(
              `Failed to fetch recipes for letter ${letter}`
            );
          }

          return (await response.json()) as MealResponse;
        })
      );

      responses.forEach((data) => {
        if (data.meals) {
          allMeals.push(...data.meals);
        }
      });
    }

    // Remove duplicate recipes.
    const uniqueMeals = Array.from(
      new Map(
        allMeals.map((meal) => [meal.idMeal, meal])
      ).values()
    );

    // Return combined recipe collection.
    return NextResponse.json({
      success: true,
      total: uniqueMeals.length,
      meals: uniqueMeals,
    });

  } catch (error) {
    console.error("All Recipes API Error:", error);

    return NextResponse.json(
      {
        success: false,
        total: 0,
        meals: [],
        message: "Unable to load recipes. Please try again.",
      },
      { status: 500 }
    );
  }
}