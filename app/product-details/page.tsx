"use client";

import RecipeHero from "../../features/product-details/components/RecipeHero";
import RecipeBackground from "../../features/product-details/components/RecipeBackground";
import RecipeIngredients from "../../features/product-details/components/RecipeIngredients";
import RecipePreparation from "../../features/product-details/components/RecipePreparation";
import RecipeInstructions from "../../features/product-details/components/RecipeInstructions";
import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import RecipeLoading from "../../features/product-details/components/RecipeLoading";
import RecipeError from "../../features/product-details/components/RecipeError";
import RecipeDetailsHeader from "../../features/product-details/components/RecipeDetailsHeader";
import RecipeDetailsFooter from "../../features/product-details/components/RecipeDetailsFooter";
import { useRecipeDetails } from "../../features/product-details/hooks/useRecipeDetails";
import { useRecipeInformation } from "../../features/product-details/hooks/useRecipeInformation";

import "./product-details.css";

// ==========================================
// PRODUCT DETAILS CONTENT
// ==========================================

function ProductDetailsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const recipeId = searchParams.get("id");

  const {
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
  } = useRecipeDetails(recipeId);

  const {
    foodProfile,
    ingredients,
    recipeTags,
  } = useRecipeInformation(recipe);

  // LOADING
  // ==========================================

  if (loading) {
    return <RecipeLoading />;
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (error || !recipe || !foodProfile) {
    return <RecipeError error={error} onBack={() => router.push("/categories")} />;
  }

  // ==========================================
  // MAIN PAGE
  // ==========================================

  return (
    <main className="product-details-page">
      <RecipeDetailsHeader />

      {/* RECIPE HERO */}

      <RecipeHero
        recipe={recipe}
        recipePrice={recipePrice}
        recipeTags={recipeTags}
        isWishlisted={isWishlisted}
        handleToggleWishlist={handleToggleWishlist}
        handleAddToCart={handleAddToCart}
        addedToCart={addedToCart}
        cartMessage={cartMessage}
        wishlistMessage={wishlistMessage}
      />

      {/* FOOD BACKGROUND */}

      <RecipeBackground
        recipe={recipe}
        foodProfile={foodProfile}
      />

      {/* INGREDIENTS */}

      <RecipeIngredients
        recipe={recipe}
        ingredients={ingredients}
      />

      {/* PREPARATION EXPERIENCE */}

      <RecipePreparation
        recipe={recipe}
        foodProfile={foodProfile}
      />

      {/* ORIGINAL RECIPE PREPARATION */}

      {recipe.strInstructions && (
        <RecipeInstructions recipe={recipe} />
      )}
      <RecipeDetailsFooter />
    </main>
  );
}

// ==========================================
// SUSPENSE WRAPPER
// ==========================================

export default function ProductDetailsPage() {
  return (
    <Suspense fallback={<RecipeLoading />}>
      <ProductDetailsContent />
    </Suspense>
  );
}
