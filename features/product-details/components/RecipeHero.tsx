"use client";


import Link from "next/link";
import type { Meal } from "../types";
import { Utensils, ChefHat, MapPin, Sparkles, Heart, ShoppingCart, Plus, CheckCircle2 } from "lucide-react";

interface RecipeHeroProps {
  recipe: Meal;
  recipePrice: number;
  recipeTags: string[];
  isWishlisted: boolean;
  handleToggleWishlist: () => void;
  handleAddToCart: () => void;
  addedToCart: boolean;
  cartMessage: string;
  wishlistMessage: string;
}

export default function RecipeHero({
  recipe,
  recipePrice,
  recipeTags,
  isWishlisted,
  handleToggleWishlist,
  handleAddToCart,
  addedToCart,
  cartMessage,
  wishlistMessage
}: RecipeHeroProps) {
  return (
    <section className="details-hero">
        <div className="details-image-wrapper">
          <div className="food-image-box">
            <img
              src={recipe.strMealThumb}
              alt={recipe.strMeal}
              loading="eager"
              onError={(event) => {
                event.currentTarget.style.visibility = "hidden";
              }}
            />
          </div>
        </div>

        <div className="details-hero-content">
          <span className="details-label">
            <Utensils size={15} />
            FOODIE RECIPE
          </span>

          <h1>{recipe.strMeal}</h1>

          <p>
            Discover the ingredients, preparation style and
            culinary traditions behind {recipe.strMeal}.
          </p>

          <div className="details-recipe-price">
            <strong>â‚¹{recipePrice}</strong>
          </div>

          <div className="details-meta">
            <span>
              <ChefHat size={18} />
              {recipe.strCategory || "Recipe"}
            </span>

            <span>
              <MapPin size={18} />
              {recipe.strArea || "International"}
            </span>

            <span>
              <Sparkles size={18} />
              Food Discovery
            </span>
          </div>

          {recipeTags.length > 0 && (
            <div className="details-tags">
              {recipeTags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          )}

          {/* WISHLIST + CART ACTIONS */}

          <div className="details-cart-actions">
            <button
              type="button"
              className={`details-wishlist-btn ${
                isWishlisted ? "active" : ""
              }`}
              onClick={handleToggleWishlist}
              aria-pressed={isWishlisted}
            >
              <Heart
                size={19}
                fill={isWishlisted ? "currentColor" : "none"}
              />

              {isWishlisted
                ? "Remove from Wishlist"
                : "Add to Wishlist"}
            </button>

            <button
              type="button"
              className="details-add-cart"
              onClick={handleAddToCart}
            >
              <ShoppingCart size={19} />
              Add to Cart
              <Plus size={17} />
            </button>

            <Link
              href="/cart"
              className="details-view-cart"
            >
              <ShoppingCart size={18} />
              View Cart
            </Link>

            <Link
              href="/wishlist"
              className="details-view-wishlist"
            >
              <Heart size={18} />
              View Wishlist
            </Link>
          </div>

          {cartMessage && (
            <div
              className={`details-cart-message ${
                addedToCart ? "success" : "error"
              }`}
              role="status"
            >
              <CheckCircle2 size={18} />
              <span>{cartMessage}</span>
            </div>
          )}

          {wishlistMessage && (
            <div
              className="details-wishlist-message"
              role="status"
            >
              <CheckCircle2 size={18} />
              <span>{wishlistMessage}</span>
            </div>
          )}
        </div>
      </section>
  );
}
