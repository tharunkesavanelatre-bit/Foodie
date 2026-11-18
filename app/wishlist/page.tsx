"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import {
  Heart,
  ShoppingCart,
  Trash2,
  ArrowLeft,
  ArrowRight,
  ChefHat,
  CheckCircle2,
  ShoppingBag,
  UtensilsCrossed,
} from "lucide-react";

import "./wishlist.css";

interface WishlistItem {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
  price?: number;
  strCategory?: string;
}

const SPECIFIC_RECIPE_PRICES: Record<string, number> = {
  "chicken biryani": 249,
  "vegetable biryani": 189,
  "mutton biryani": 279,
  "paneer curry": 179,
  "butter chicken": 269,
  "fish curry": 289,
  "chocolate cake": 139,
  "margherita pizza": 199,
  "chicken burger": 219,
  "fruit salad": 99,
  "chicken pasta": 229,
  "prawn curry": 299,
  "egg fried rice": 169,
  "vegetable fried rice": 149,
  "masala dosa": 119,
  "chicken tikka": 239,
  pancakes: 129,
  lasagne: 219,
};

function getRecipePrice(
  recipeId: string,
  recipeName: string,
  category?: string
): number {
  const name = recipeName.toLowerCase().trim();
  const recipeCategory = (category || "").toLowerCase();

  for (const [recipe, price] of Object.entries(
    SPECIFIC_RECIPE_PRICES
  )) {
    if (name.includes(recipe)) return price;
  }

  let minPrice = 129;
  let maxPrice = 249;

  if (
    recipeCategory.includes("seafood") ||
    /fish|prawn|shrimp|crab|lobster|salmon|tuna|squid|octopus|mussel|oyster/.test(name)
  ) {
    minPrice = 229;
    maxPrice = 349;
  } else if (
    recipeCategory.includes("chicken") ||
    name.includes("chicken")
  ) {
    minPrice = 189;
    maxPrice = 299;
  } else if (
    recipeCategory.includes("dessert") ||
    /cake|ice cream|pudding|brownie|cookie|mousse|tart/.test(name)
  ) {
    minPrice = 99;
    maxPrice = 199;
  } else if (
    recipeCategory.includes("vegetarian") ||
    recipeCategory.includes("vegan")
  ) {
    minPrice = 119;
    maxPrice = 229;
  } else if (recipeCategory.includes("pasta")) {
    minPrice = 149;
    maxPrice = 249;
  } else if (
    recipeCategory.includes("beef") ||
    recipeCategory.includes("lamb")
  ) {
    minPrice = 199;
    maxPrice = 299;
  }

  let hash = 0;

  for (let i = 0; i < recipeId.length; i++) {
    hash = (hash * 31 + recipeId.charCodeAt(i)) >>> 0;
  }

  return minPrice + (hash % (maxPrice - minPrice + 1));
}

function getItemPrice(item: WishlistItem): number {
  if (
    typeof item.price === "number" &&
    Number.isFinite(item.price) &&
    item.price > 0
  ) {
    return item.price;
  }

  return getRecipePrice(
    item.idMeal,
    item.strMeal,
    item.strCategory
  );
}

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [message, setMessage] = useState("");

  const showMessage = (text: string) => {
    setMessage(text);

    window.setTimeout(() => {
      setMessage("");
    }, 3500);
  };

  const fetchWishlist = async () => {
    try {
      const response = await fetch("/api/wishlist");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load wishlist.");
      }

      const items: WishlistItem[] = (data.items || []).map(
        (item: {
          idMeal: string;
          name: string;
          image: string | null;
          price: number | null;
          category: string | null;
        }) => ({
          idMeal: item.idMeal,
          strMeal: item.name,
          strMealThumb: item.image || "",
          price: item.price ? Number(item.price) : undefined,
          strCategory: item.category || undefined,
        })
      );

      setWishlist(items);
    } catch (error) {
      console.error("Wishlist fetch error:", error);
      showMessage(
        error instanceof Error
          ? error.message
          : "Unable to load wishlist."
      );
    } finally {
      setIsLoaded(true);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemove = async (idMeal: string) => {
    try {
      const response = await fetch(
        `/api/wishlist/${encodeURIComponent(idMeal)}`,
        { method: "DELETE" }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to remove recipe.");
      }

      setWishlist((previous) =>
        previous.filter((item) => item.idMeal !== idMeal)
      );

      showMessage("Recipe removed from your wishlist.");
    } catch (error) {
      console.error("Wishlist remove error:", error);
      showMessage("Unable to remove recipe.");
    }
  };

  const handleClearWishlist = async () => {
    try {
      const response = await fetch("/api/wishlist", {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to clear wishlist.");
      }

      setWishlist([]);
      showMessage("Your wishlist has been cleared.");
    } catch (error) {
      console.error("Wishlist clear error:", error);
      showMessage("Unable to clear wishlist.");
    }
  };

  const handleAddToCart = async (item: WishlistItem) => {
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          idMeal: item.idMeal,
          name: item.strMeal,
          price: getItemPrice(item),
          image: item.strMealThumb,
          category: item.strCategory,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to add recipe to cart.");
      }

      showMessage(`${item.strMeal} added to your cart!`);
    } catch (error) {
      console.error("Unable to add item to cart:", error);
      showMessage(
        error instanceof Error
          ? error.message
          : "Unable to add recipe to cart."
      );
    }
  };

  if (!isLoaded) {
    return (
      <main className="wishlist-loading">
        <div className="wishlist-spinner"></div>
        <p>Loading your wishlist...</p>
      </main>
    );
  }

  return (
    <main className="wishlist-page">
      <header className="wishlist-header">
        <Link href="/home" className="wishlist-brand">
          <ChefHat size={28} />
          <span>FOODIE</span>
        </Link>

        <Link href="/products" className="wishlist-back">
          <ArrowLeft size={17} />
          Continue Shopping
        </Link>
      </header>

      <section className="wishlist-hero">
        <div className="wishlist-hero-icon">
          <Heart size={30} fill="currentColor" />
        </div>

        <span className="wishlist-eyebrow">
          YOUR PERSONAL COLLECTION
        </span>

        <h1>
          My <span>Wishlist</span>
        </h1>

        <p>
          Keep your favourite recipes in one place
          and discover something delicious whenever
          you want.
        </p>

        <div className="wishlist-count">
          <Heart size={15} />
          <span>
            {wishlist.length} Saved{" "}
            {wishlist.length === 1 ? "Recipe" : "Recipes"}
          </span>
        </div>
      </section>

      {message && (
        <div className="wishlist-message" role="status">
          <CheckCircle2 size={18} />
          <span>{message}</span>

          <button
            type="button"
            onClick={() => setMessage("")}
            aria-label="Close message"
          >
            ×
          </button>
        </div>
      )}

      <section className="wishlist-content">
        {wishlist.length === 0 ? (
          <div className="wishlist-empty">
            <div className="wishlist-empty-icon">
              <Heart size={48} />
            </div>

            <h2>Your Wishlist is Empty</h2>

            <p>
              You haven&apos;t saved any recipes yet.
              Explore delicious recipes and add
              your favourites here!
            </p>

            <Link
              href="/products"
              className="wishlist-explore-btn"
            >
              <UtensilsCrossed size={18} />
              Explore Recipes
              <ArrowRight size={17} />
            </Link>
          </div>
        ) : (
          <>
            <div className="wishlist-section-heading">
              <div>
                <span>YOUR FAVOURITES</span>
                <h2>Saved Recipes</h2>
              </div>

              <button
                type="button"
                className="wishlist-clear-btn"
                onClick={handleClearWishlist}
              >
                <Trash2 size={16} />
                Clear Wishlist
              </button>
            </div>

            <div className="wishlist-grid">
              {wishlist.map((item, index) => {
                const recipePrice = getItemPrice(item);

                const recipeHref = /^\d+$/.test(item.idMeal)
                  ? `/product-details?id=${encodeURIComponent(item.idMeal)}`
                  : `/products/${encodeURIComponent(item.idMeal)}`;

                return (
                  <article
                    className="wishlist-card"
                    key={item.idMeal}
                    style={{
                      animationDelay: `${index * 0.08}s`,
                    }}
                  >
                    <div className="wishlist-card-image">
                      <Link href={recipeHref}>
                        <img
                          src={item.strMealThumb}
                          alt={item.strMeal}
                        />
                      </Link>

                      <button
                        type="button"
                        className="wishlist-remove-icon"
                        onClick={() => handleRemove(item.idMeal)}
                        aria-label={`Remove ${item.strMeal} from wishlist`}
                      >
                        <Heart size={19} fill="currentColor" />
                      </button>
                    </div>

                    <div className="wishlist-card-body">
                      <span className="wishlist-card-label">
                        <ChefHat size={14} />
                        FOODIE RECIPE
                      </span>

                      <h3>{item.strMeal}</h3>

                      <div className="wishlist-card-price">
                        <strong>
                          ₹{recipePrice.toFixed(2)}
                        </strong>
                      </div>

                      <div className="wishlist-card-actions">
                        <Link
                          href={recipeHref}
                          className="wishlist-view-btn"
                        >
                          View Recipe
                          <ArrowRight size={16} />
                        </Link>

                        <button
                          type="button"
                          className="wishlist-cart-btn"
                          onClick={() => handleAddToCart(item)}
                          aria-label={`Add ${item.strMeal} to cart`}
                        >
                          <ShoppingCart size={18} />
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}
      </section>

      <section className="wishlist-bottom">
        <div className="wishlist-bottom-icon">
          <ShoppingBag size={25} />
        </div>

        <h2>Discover More Delicious Recipes</h2>

        <p>
          Explore our recipe collection and find
          your next favourite meal.
        </p>

        <Link href="/products">
          Explore Recipes
          <ArrowRight size={17} />
        </Link>
      </section>
    </main>
  );
}