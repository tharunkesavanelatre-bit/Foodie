"use client";

import { useEffect, useState } from "react";

import type {
  Meal,
  CartItem,
  WishlistItem,
} from "../types";

import { getRecipeDetails } from "../services/recipeDetailsService";
import { getRecipePrice } from "../utils/recipePrice";

const CART_KEY = "foodie_cart";
const WISHLIST_KEY = "foodie_wishlist";

function readStorage<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key);

    if (!value) return fallback;

    const parsed: unknown = JSON.parse(value);

    return Array.isArray(parsed) ? (parsed as T) : fallback;
  } catch (error) {
    console.error(`Unable to read ${key}:`, error);
    return fallback;
  }
}

function writeStorage(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Unable to save ${key}:`, error);
    return false;
  }
}

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

  // Fetch recipe details
  useEffect(() => {
    if (!recipeId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
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

    return () => {
      controller.abort();
    };
  }, [recipeId]);

  // Check wishlist status
  useEffect(() => {
    if (!recipe) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsWishlisted(false);
      return;
    }

    const wishlist = readStorage<WishlistItem[]>(
      WISHLIST_KEY,
      []
    );

    setIsWishlisted(
      wishlist.some((item) => item.idMeal === recipe.idMeal)
    );
  }, [recipe]);

  // Add or remove wishlist item
  const handleToggleWishlist = () => {
    if (!recipe) return;

    const wishlist = readStorage<WishlistItem[]>(
      WISHLIST_KEY,
      []
    );

    const existingItem = wishlist.some(
      (item) => item.idMeal === recipe.idMeal
    );

    const updatedWishlist = existingItem
      ? wishlist.filter((item) => item.idMeal !== recipe.idMeal)
      : [
          ...wishlist,
          {
            idMeal: recipe.idMeal,
            strMeal: recipe.strMeal,
            strMealThumb: recipe.strMealThumb,
            price: recipePrice,
          },
        ];

    if (!writeStorage(WISHLIST_KEY, updatedWishlist)) {
      setWishlistMessage(
        "Unable to update wishlist. Please try again."
      );
      return;
    }

    setIsWishlisted(!existingItem);

    setWishlistMessage(
      existingItem
        ? "Recipe removed from your wishlist."
        : "Recipe added to your wishlist!"
    );

    window.setTimeout(() => {
      setWishlistMessage("");
    }, 3500);
  };

  // Add recipe to cart
  const handleAddToCart = () => {
    if (!recipe) return;

    const cart = readStorage<CartItem[]>(CART_KEY, []);

    const existingItem = cart.find(
      (item) => item.idMeal === recipe.idMeal
    );

    const updatedCart = existingItem
      ? cart.map((item) =>
          item.idMeal === recipe.idMeal
            ? {
                ...item,
                price: recipePrice,
                quantity: Math.max(
                  1,
                  Number(item.quantity || 0)
                ) + 1,
              }
            : item
        )
      : [
          ...cart,
          {
            idMeal: recipe.idMeal,
            strMeal: recipe.strMeal,
            strMealThumb: recipe.strMealThumb,
            price: recipePrice,
            quantity: 1,
          },
        ];

    if (!writeStorage(CART_KEY, updatedCart)) {
      setCartMessage(
        "Unable to add recipe. Please check your browser storage."
      );
      setAddedToCart(false);
      return;
    }

    setAddedToCart(true);

    setCartMessage(
      existingItem
        ? "Recipe quantity updated in your cart!"
        : "Recipe successfully added to your cart!"
    );

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
