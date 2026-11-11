"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Clock3,
  ChefHat,
  Search,
  UtensilsCrossed,
  Star,
  Home,
  Heart,
  PlayCircle,
  Sparkles,
} from "lucide-react";

import "./categories.css";

// ==========================================
// TYPES
// ==========================================

interface Meal {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
}

interface MealResponse {
  meals: Meal[] | null;
}

interface WishlistItem {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
  price?: number;
}

// ==========================================
// CONSTANTS
// ==========================================

const WISHLIST_KEY = "foodie_wishlist";

// ==========================================
// FOOD CATEGORIES
// ==========================================

const categories = [
  {
    name: "Pizza",
    search: "pizza",
    image:
      "https://images.unsplash.com/photo-1579751626657-72bc17010498?w=700&q=85",
    description: "Delicious pizza varieties",
  },
  {
    name: "Burgers",
    search: "burger",
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=700&q=85",
    description: "Juicy and delicious burgers",
  },
  {
    name: "Biryani",
    search: "biryani",
    image:
      "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=700&q=85",
    description: "Authentic biryani recipes",
  },
  {
    name: "Pasta",
    search: "pasta",
    image:
      "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=700&q=85",
    description: "Italian pasta favorites",
  },
  {
    name: "Chicken",
    search: "chicken",
    image:
      "https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=700&q=85",
    description: "Tasty chicken recipes",
  },
  {
    name: "Desserts",
    search: "dessert",
    image:
      "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=700&q=85",
    description: "Sweet treats and desserts",
  },
  {
    name: "Rice",
    search: "rice",
    image:
      "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=700&q=85",
    description: "Rice dishes from around the world",
  },
  {
    name: "Salad",
    search: "salad",
    image:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=700&q=85",
    description: "Fresh and healthy salads",
  },
  {
    name: "Seafood",
    search: "seafood",
    image:
      "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=700&q=85",
    description: "Fresh seafood recipes",
  },
];

// ==========================================
// COMPONENT
// ==========================================

export default function CategoriesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    null
  );

  const [recipes, setRecipes] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  // WISHLIST STATES

  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [wishlistLoaded, setWishlistLoaded] = useState(false);

  // ==========================================
  // LOAD WISHLIST
  // ==========================================

  useEffect(() => {
    const loadWishlist = () => {
      try {
        const savedWishlist = localStorage.getItem(WISHLIST_KEY);

        if (!savedWishlist) {
          setWishlistIds([]);
          return;
        }

        const parsedWishlist: unknown = JSON.parse(savedWishlist);

        if (Array.isArray(parsedWishlist)) {
          const ids = parsedWishlist
            .filter(
              (item): item is WishlistItem =>
                typeof item?.idMeal === "string"
            )
            .map((item) => item.idMeal);

          setWishlistIds(ids);
        } else {
          setWishlistIds([]);
        }
      } catch (error) {
        console.error("Unable to load wishlist:", error);
        setWishlistIds([]);
      } finally {
        setWishlistLoaded(true);
      }
    };

    loadWishlist();

    window.addEventListener("storage", loadWishlist);

    return () => {
      window.removeEventListener("storage", loadWishlist);
    };
  }, []);

  // ==========================================
  // FETCH RECIPES
  // ==========================================

  useEffect(() => {
    if (!selectedCategory) return;

    const category = categories.find(
      (item) => item.name === selectedCategory
    );

    if (!category) return;

    const controller = new AbortController();
    let isActive = true;

    const timeout = setTimeout(() => {
      controller.abort();
    }, 20000);

    const fetchRecipes = async () => {
      setLoading(true);
      setError("");
      setRecipes([]);

      try {
        const response = await fetch(
          `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(
            category.search
          )}`,
          {
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }

        const data: MealResponse = await response.json();

        if (!isActive) return;

        setRecipes(data.meals ?? []);
      } catch (err) {
        if (!isActive) return;

        if (err instanceof Error && err.name === "AbortError") {
          setError("Request timed out. Please try again.");
        } else {
          setError(
            "Unable to load recipes. Please check your internet connection."
          );
        }
      } finally {
        clearTimeout(timeout);

        if (isActive) {
          setLoading(false);
        }
      }
    };

    fetchRecipes();

    return () => {
      isActive = false;
      clearTimeout(timeout);
      controller.abort();
    };
  }, [selectedCategory, retryCount]);

  // ==========================================
  // TOGGLE WISHLIST
  // ==========================================

  const handleToggleWishlist = (recipe: Meal) => {
    if (!wishlistLoaded) return;

    try {
      const savedWishlist = localStorage.getItem(WISHLIST_KEY);

      let wishlist: WishlistItem[] = [];

      if (savedWishlist) {
        const parsedWishlist: unknown = JSON.parse(savedWishlist);

        if (Array.isArray(parsedWishlist)) {
          wishlist = parsedWishlist as WishlistItem[];
        }
      }

      const alreadyExists = wishlist.some(
        (item) => item.idMeal === recipe.idMeal
      );

      let updatedWishlist: WishlistItem[];

      if (alreadyExists) {
        updatedWishlist = wishlist.filter(
          (item) => item.idMeal !== recipe.idMeal
        );
      } else {
        const newItem: WishlistItem = {
          idMeal: recipe.idMeal,
          strMeal: recipe.strMeal,
          strMealThumb: recipe.strMealThumb,
        };

        updatedWishlist = [...wishlist, newItem];
      }

      localStorage.setItem(
        WISHLIST_KEY,
        JSON.stringify(updatedWishlist)
      );

      setWishlistIds(
        updatedWishlist.map((item) => item.idMeal)
      );
    } catch (error) {
      console.error("Unable to update wishlist:", error);
    }
  };

  // ==========================================
  // SEARCH FILTER
  // ==========================================

  const filteredRecipes = recipes.filter((recipe) =>
    recipe.strMeal.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ==========================================
  // BACK TO CATEGORIES
  // ==========================================

  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setRecipes([]);
    setSearchTerm("");
    setError("");
    setRetryCount(0);
  };

  // ==========================================
  // SHARED HEADER
  // ==========================================

  const Header = () => (
    <header className="categories-site-header">
      <div className="categories-header-inner">

        <Link href="/home" className="categories-brand">
          <span className="categories-brand-icon">
            <ChefHat size={28} strokeWidth={2.5} />
          </span>

          <span>Foodie</span>
        </Link>

        <nav
          className="categories-navigation"
          aria-label="Main navigation"
        >

          <Link href="/home" className="btn btn--outline">
            <Home size={19} aria-hidden="true" />
            Home
          </Link>

          <Link
            href="/wishlist"
            className="categories-wishlist-link"
          >
            <Heart size={17} />
            Wishlist

            <span>{wishlistIds.length}</span>
          </Link>

          {selectedCategory && (
            <button
              type="button"
              className="btn btn--soft"
              onClick={handleBackToCategories}
            >
              <ArrowLeft size={19} aria-hidden="true" />
              Back to Categories
            </button>
          )}

        </nav>
      </div>
    </header>
  );

  // ==========================================
  // CATEGORY VIEW
  // ==========================================

  if (!selectedCategory) {
    return (
      <main className="categories-page">
        <Header />

        {/* =====================================
            PREMIUM CATEGORY HERO
        ===================================== */}

        <section className="categories-hero">

          <div className="categories-hero-inner">

            {/* LEFT CONTENT */}

            <div className="categories-hero-content">

              <span className="categories-label">
                <UtensilsCrossed size={16} />
                FOODIE RECIPES
              </span>

              <h1>
                Discover Your
                <br />
                <span>Favorite Food</span>
              </h1>

              <p>
                Explore delicious recipes from different cuisines and
                discover something new to cook today.
              </p>

              {/* HERO BUTTONS */}

              <div className="categories-hero-actions">

                <a
                  href="#categories-list"
                  className="categories-primary-btn"
                >
                  Explore Foods
                  <ArrowRight size={19} />
                </a>

                

              </div>

              {/* HERO STATS */}

              <div className="categories-hero-stats">

                <div>
                  <strong>9+</strong>
                  <span>Food Categories</span>
                </div>

                <div className="categories-stat-divider"></div>

                <div>
                  <strong>100s</strong>
                  <span>Recipe Possibilities</span>
                </div>

              </div>

            </div>

            {/* RIGHT FOOD VISUAL */}

            <div className="categories-hero-visual">

              {/* DECORATIVE CIRCLES */}

              <div className="categories-hero-orbit"></div>

              <div className="categories-hero-orbit-inner"></div>

              <div className="categories-hero-glow"></div>

              {/* MAIN FOOD IMAGE */}

              <div className="categories-main-food-image">

                <img
                  src="https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=400&q=85"
                  alt="Delicious pasta with fresh herbs"
                  fetchPriority="high"
                  decoding="async"
                />

              </div>

              {/* FLOATING FOOD IMAGE 1 */}

              <div className="categories-floating-food categories-food-one">

                <img
                  src="https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=1200&q=90"
                  alt="Fresh red tomatoes"
                  loading="lazy"
                  decoding="async"
                />

              </div>

              {/* FLOATING FOOD IMAGE 2 */}

              <div className="categories-floating-food categories-food-two">

                <img
                  src="https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=400&q=85"
                  alt="Fresh vegetable salad"
                  loading="lazy"
                  decoding="async"
                />

              </div>

              {/* FLOATING FOOD IMAGE 3 */}

              <div className="categories-floating-food categories-food-three">

                <img
                  src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=85"
                  alt="Fresh food ingredients"
                  loading="lazy"
                  decoding="async"
                />

              </div>

              {/* DECORATIVE SPARKLES */}

              <div className="categories-hero-sparkle sparkle-one">
                <Sparkles size={25} />
              </div>

              <div className="categories-hero-sparkle sparkle-two">
                <Sparkles size={18} />
              </div>

            </div>

          </div>

        </section>

        {/* =====================================
            CATEGORY CONTENT
        ===================================== */}

        <section
          className="categories-content"
          id="categories-list"
        >

          <div className="categories-heading">
            <div>
              <span className="section-label">EXPLORE FOOD</span>
              <h2>Browse Categories</h2>
              <p>Choose your favorite food category.</p>
            </div>
          </div>

          <div className="categories-grid">
            {categories.map((category) => (
              <button
                key={category.name}
                type="button"
                className="categories-card"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory(category.name);
                }}
              >
                <div className="categories-card-image">

                  <img
                    src={category.image}
                    alt={category.name}
                    loading="lazy"
                  />

                  <span className="categories-card-arrow">
                    <ArrowRight size={20} />
                  </span>

                </div>

                <div className="categories-card-info">
                  <div>
                    <h3>{category.name}</h3>
                    <p>{category.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

        </section>
      </main>
    );
  }

  // ==========================================
  // RECIPES VIEW
  // ==========================================

  return (
    <main className="categories-page">
      <Header />

      <section className="recipes-hero">

        <span className="categories-label">
          <ChefHat size={16} />
          FOODIE RECIPES
        </span>

        <h1>
          Delicious <span>{selectedCategory}</span>
        </h1>

        <p>
          Explore amazing {selectedCategory.toLowerCase()} recipes
          and discover your next favorite meal.
        </p>

      </section>

      <section className="categories-content recipes-content">

        <div className="recipes-heading">

          <div>
            <span className="section-label">FRESH RECIPES</span>

            <h2>{selectedCategory} Recipes</h2>

            <p>
              {loading
                ? "Finding delicious recipes..."
                : `${filteredRecipes.length} recipes available`}
            </p>
          </div>

          <div className="recipes-search">
            <Search size={18} />

            <input
              type="text"
              placeholder="Search recipes..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              aria-label="Search recipes"
            />
          </div>

        </div>

        {/* LOADING */}

        {loading && (
          <div className="recipes-loading">
            <div className="recipes-spinner" />

            <h3>Finding delicious recipes...</h3>

            <p>Please wait while we prepare your food collection.</p>
          </div>
        )}

        {/* ERROR */}

        {!loading && error && (
          <div className="recipes-error">

            <h3>Oops! Something went wrong.</h3>

            <p>{error}</p>

            <button
              type="button"
              onClick={() => setRetryCount((prev) => prev + 1)}
            >
              Try Again
            </button>

            <button
              type="button"
              onClick={handleBackToCategories}
            >
              Back to Categories
            </button>

          </div>
        )}

        {/* EMPTY */}

        {!loading && !error && recipes.length === 0 && (
          <div className="recipes-empty">

            <ChefHat size={42} />

            <h3>No recipes found</h3>

            <p>
              TheMealDB doesn't currently have recipes matching
              this category.
            </p>

            <button
              type="button"
              onClick={handleBackToCategories}
            >
              Explore Other Categories
            </button>

          </div>
        )}

        {/* RECIPE GRID */}

        {!loading && !error && filteredRecipes.length > 0 && (
          <div className="recipe-grid">

            {filteredRecipes.map((recipe) => {
              const isWishlisted = wishlistIds.includes(recipe.idMeal);

              return (
                <article
                  className="recipe-card"
                  key={recipe.idMeal}
                >

                  <div className="recipe-card-image">

                    <img
                      src={recipe.strMealThumb}
                      alt={recipe.strMeal}
                      loading="lazy"
                    />

                    <span className="recipe-category-badge">
                      {selectedCategory}
                    </span>

                    {/* WISHLIST BUTTON */}

                    <button
                      type="button"
                      className={`recipe-wishlist-btn ${
                        isWishlisted ? "active" : ""
                      }`}
                      onClick={() => handleToggleWishlist(recipe)}
                      aria-label={
                        isWishlisted
                          ? `Remove ${recipe.strMeal} from wishlist`
                          : `Add ${recipe.strMeal} to wishlist`
                      }
                      aria-pressed={isWishlisted}
                      disabled={!wishlistLoaded}
                    >
                      <Heart
                        size={20}
                        fill={
                          isWishlisted
                            ? "currentColor"
                            : "none"
                        }
                      />
                    </button>

                  </div>

                  <div className="recipe-card-content">

                    <h3>{recipe.strMeal}</h3>

                    <div className="recipe-card-meta">

                      <span>
                        <Star
                          size={15}
                          fill="#F59E0B"
                          color="#F59E0B"
                        />
                        <span>Recipe</span>
                      </span>

                      <span>
                        <Clock3 size={15} />
                        <span>30–45 min</span>
                      </span>

                    </div>

                    <Link
                      href={`/product-details?id=${recipe.idMeal}`}
                      className="recipe-view-button"
                    >
                      View Recipe
                      <ArrowRight size={17} />
                    </Link>

                  </div>

                </article>
              );
            })}

          </div>
        )}

        {/* SEARCH EMPTY */}

        {!loading &&
          !error &&
          recipes.length > 0 &&
          filteredRecipes.length === 0 && (
            <div className="recipes-empty">

              <Search size={38} />

              <h3>No matching recipes</h3>

              <p>Try searching with a different recipe name.</p>

            </div>
          )}

      </section>
    </main>
  );
}