import { NextResponse } from "next/server";

// ==========================================
// TYPES
// ==========================================

interface Meal {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
  strCategory?: string;
  strArea?: string;
  [key: string]: string | undefined;
}

interface MealResponse {
  meals: Meal[] | null;
}

// ==========================================
// THEMEALDB API
// ==========================================

const API_URL =
  "https://www.themealdb.com/api/json/v1/1";

// ==========================================
// GET ALL RECIPES
// ==========================================

export async function GET() {
  try {
    const letters = "abcdefghijklmnopqrstuvwxyz".split("");

    console.log("FOODIE: Starting recipe fetching...");

    // ========================================
    // FETCH ALL LETTERS CONCURRENTLY
    // ========================================

    const results = await Promise.allSettled(
      letters.map(async (letter) => {
        const response = await fetch(
          `${API_URL}/search.php?f=${letter}`,
          {
            next: { revalidate: 3600 },
            signal: AbortSignal.timeout(12000),
          }
        );

        if (!response.ok) {
          throw new Error(
            `Request failed for letter ${letter}: ${response.status}`
          );
        }

        const data: MealResponse = await response.json();

        return data.meals || [];
      })
    );

    // ========================================
    // COLLECT SUCCESSFUL RECIPES
    // ========================================

    const allMeals: Meal[] = [];

    let failedRequests = 0;

    results.forEach((result, index) => {
      if (result.status === "fulfilled") {
        allMeals.push(...result.value);
      } else {
        failedRequests++;

        console.error(
          `FOODIE: Failed to fetch letter ${letters[index]}:`,
          result.reason
        );
      }
    });

    // ========================================
    // REMOVE DUPLICATES
    // ========================================

    const uniqueMeals = Array.from(
      new Map(
        allMeals
          .filter(
            (meal) =>
              meal &&
              typeof meal.idMeal === "string" &&
              typeof meal.strMeal === "string" &&
              typeof meal.strMealThumb === "string"
          )
          .map((meal) => [meal.idMeal, meal])
      ).values()
    );

    // ========================================
    // CHECK RECIPE AVAILABILITY
    // ========================================

    if (uniqueMeals.length === 0) {
      console.error(
        "FOODIE: No recipes received from TheMealDB."
      );

      return NextResponse.json(
        {
          success: false,
          total: 0,
          meals: [],
          message:
            "Unable to load recipes. Please try again.",
        },
        { status: 502 }
      );
    }

    // ========================================
    // SUCCESS RESPONSE
    // ========================================

    console.log(
      `FOODIE: Successfully loaded ${uniqueMeals.length} recipes.`
    );

    console.log(
      `FOODIE: Failed requests: ${failedRequests}`
    );

    return NextResponse.json({
      success: true,
      total: uniqueMeals.length,
      meals: uniqueMeals,
      failedRequests,
    });

  } catch (error) {
    console.error("FOODIE Recipes API Error:", error);

    return NextResponse.json(
      {
        success: false,
        total: 0,
        meals: [],
        message:
          "Unable to load recipes. Please try again.",
      },
      { status: 500 }
    );
  }
}