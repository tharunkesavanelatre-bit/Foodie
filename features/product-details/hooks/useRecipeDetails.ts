"use client";

import { useEffect, useState } from "react";

import type { Meal } from "../types";

import { getRecipeDetails } from "../services/recipeDetailsService";
import { getRecipePrice } from "../utils/recipePrice";

export function useRecipeDetails(recipeId: string | null) {
  const [recipe, setRecipe] = useState<Meal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [addedToCart, setAddedToCart] = useState(false);
  const [cartMessage, setCartMessage] = useState("");

  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistMessage, setWishlistMessage] = useState("");

  const recipePrice = recipe
    ? getRecipePrice(
        recipe.idMeal,
        recipe.strMeal,
        recipe.strCategory
      )
    : 0;

  // FETCH RECIPE DETAILS
  useEffect(() => {
    if (!recipeId) {
      setRecipe(null);
      setError("Recipe ID is missing.");
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    const fetchRecipe = async () => {
      setLoading(true);
      setError("");
      setRecipe(null);

      try {
        const foundRecipe = await getRecipeDetails(
          recipeId,
          controller.signal
        );

        setRecipe(foundRecipe);
      } catch (err) {
        if (controller.signal.aborted) return;

        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong. Please try again."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchRecipe();

    return () => controller.abort();
  }, [recipeId]);

  // CHECK WISHLIST STATUS
  useEffect(() => {
    if (!recipe) return;

    let cancelled = false;

    const checkWishlist = async () => {
      try {
        const response = await fetch("/api/wishlist");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message);
        }

        const exists = data.items.some(
          (item: { idMeal: string }) =>
            item.idMeal === recipe.idMeal
        );

        if (!cancelled) {
          setIsWishlisted(exists);
        }
      } catch (error) {
        console.error("Wishlist check error:", error);
      }
    };

    checkWishlist();

    return () => {
      cancelled = true;
    };
  }, [recipe]);

  // ADD OR REMOVE WISHLIST ITEM
  const handleToggleWishlist = async () => {
  if (!recipe) return;

  console.log("1. Wishlist button clicked");

  try {
    const response = await fetch("/api/wishlist", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        idMeal: recipe.idMeal,
        strMeal: recipe.strMeal,
        strMealThumb: recipe.strMealThumb,
        strCategory: recipe.strCategory,
        price: recipePrice,
      }),
    });

    const data = await response.json();

    console.log("2. API Status:", response.status);
    console.log("3. API Response:", data);

    if (!response.ok) {
      throw new Error(data.message);
    }

    setIsWishlisted(true);
    setWishlistMessage("Recipe added to your wishlist!");
  } catch (error) {
    console.error("Wishlist Error:", error);
    setWishlistMessage(
      error instanceof Error ? error.message : "Something went wrong."
    );
  }
};
  // ADD RECIPE TO CART
  const handleAddToCart = async () => {
    if (!recipe) return;

    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          idMeal: recipe.idMeal,
          name: recipe.strMeal,
          price: recipePrice,
          image: recipe.strMealThumb,
          category: recipe.strCategory,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to add recipe to cart.");
      }

      setAddedToCart(true);
      setCartMessage("Recipe successfully added to your cart!");
    } catch (error) {
      console.error("Cart error:", error);

      setAddedToCart(false);

      setCartMessage(
        error instanceof Error
          ? error.message
          : "Unable to add recipe to cart."
      );
    }

    window.setTimeout(() => {
      setAddedToCart(false);
      setCartMessage("");
    }, 4000);
  };

  return {
    recipe,
    loading,
    error,
    recipePrice,
    addedToCart,
    cartMessage,
    isWishlisted,
    wishlistMessage,
    handleToggleWishlist,
    handleAddToCart,
  };
}
