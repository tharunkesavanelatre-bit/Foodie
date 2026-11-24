"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import {
  ArrowRight,
  Clock3,
  Star,
  Heart,
} from "lucide-react";

import HeroSection from "../../components/home/HeroSection";

import "./home.css";

// ==========================================
// TYPES
// ==========================================

interface Recipe {
  id: number;
  name: string;
  image: string;
  cuisine: string;
  rating: number;
  reviewCount: number;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  difficulty: string;
  caloriesPerServing: number;
}

interface RecipeResponse {
  recipes: Recipe[];
  total: number;
  skip: number;
  limit: number;
}

// ==========================================
// CATEGORIES
// ==========================================

const categories = [
  {
    name: "Pizza",
    image:
      "https://images.unsplash.com/photo-1579751626657-72bc17010498?w=500",
  },
  {
    name: "Burgers",
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500",
  },
  {
    name: "Biryani",
    image:
      "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=700&q=85",
  },
  {
    name: "Desserts",
    image:
      "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=500",
  },
  {
    name: "Salads",
    image:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500",
  },
];

// ==========================================
// HOME PAGE
// ==========================================

export default function HomePage() {
  const [dishes, setDishes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ========================================
  // FETCH RECIPES FROM DUMMYJSON
  // ========================================

  useEffect(() => {
    const controller = new AbortController();

    const fetchRecipes = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "https://dummyjson.com/recipes?limit=0",
          {
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          throw new Error("Unable to fetch recipes.");
        }

        const data: RecipeResponse = await response.json();

        if (!data.recipes || data.recipes.length === 0) {
          throw new Error("No recipes found.");
        }

        // Get the four highest-rated recipes
        const popularRecipes = [...data.recipes]
          .sort((a, b) => b.rating - a.rating)
          .slice(0, 4);

        setDishes(popularRecipes);
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          setError("Unable to load recipes. Please try again.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchRecipes();

    return () => controller.abort();
  }, []);

  return (
    <main className="foodie-home">

      {/* HERO SECTION */}

      <HeroSection />

      {/* ======================================
          CATEGORIES
      ====================================== */}

      <section className="home-section">

        <div className="section-heading">

          <div>
            <span className="section-label">
              WHAT ARE YOU CRAVING?
            </span>

            <h2>Explore Categories</h2>

            <p>
              Find something delicious for every craving.
            </p>
          </div>

          <Link href="/categories" className="view-all">
            View all <ArrowRight size={17} />
          </Link>

        </div>

        <div className="category-grid">

          {categories.map((category) => (
            <Link
              href="/categories"
              className="category-card"
              key={category.name}
            >

              <div
                className="category-image"
                style={{
                  backgroundImage: `url(${category.image})`,
                }}
              />

              <h3>{category.name}</h3>

            </Link>
          ))}

        </div>

      </section>

      {/* ======================================
          POPULAR DISHES
      ====================================== */}

      <section className="home-section popular-section">

        <div className="section-heading">

          <div>
            <span className="section-label">
              CUSTOMER FAVOURITES
            </span>

            <h2>Popular Right Now</h2>

            <p>
              Delicious picks from our food collection.
            </p>
          </div>

          <Link href="/products" className="view-all">
            Explore menu <ArrowRight size={17} />
          </Link>

        </div>

        {/* LOADING */}

        {loading && (
          <div className="dish-grid">
            {[1, 2, 3, 4].map((item) => (
              <div className="dish-card" key={item}>
                <div className="dish-image" />
                <div className="dish-info">
                  <p>Loading delicious recipes...</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ERROR */}

        {!loading && error && (
          <div className="dish-error">
            {error}
          </div>
        )}

        {/* RECIPES */}

        {!loading && !error && (
          <div className="dish-grid">

            {dishes.map((dish) => {

              const totalTime =
                dish.prepTimeMinutes + dish.cookTimeMinutes;

              return (
                <article className="dish-card" key={dish.id}>

                  <div
                    className="dish-image"
                    style={{
                      backgroundImage: `url(${dish.image})`,
                    }}
                  >

                    <span className="dish-offer">
                      {dish.difficulty}
                    </span>

                    <button
                      type="button"
                      className="dish-favourite"
                      aria-label={`Add ${dish.name} to wishlist`}
                    >
                      <Heart size={18} />
                    </button>

                  </div>

                  <div className="dish-info">

                    <div className="dish-title-row">

                      <h3>{dish.name}</h3>

                      <span className="dish-rating">
                        <Star size={14} fill="currentColor" />
                        {dish.rating.toFixed(1)}
                      </span>

                    </div>

                    <p>{dish.cuisine} Cuisine</p>

                    <div className="dish-bottom">

                      <strong>
                        {dish.caloriesPerServing} kcal
                      </strong>

                      <span>
                        <Clock3 size={14} />
                        {totalTime} min
                      </span>

                    </div>

                    <Link
                      href="/products"
                      className="dish-order-button"
                    >
                      View Recipe <ArrowRight size={16} />
                    </Link>

                  </div>

                </article>
              );
            })}

          </div>
        )}

      </section>

      {/* ======================================
          PROMOTIONAL BANNER
      ====================================== */}

      <section className="promo-banner">

        <div>

          <span>YOUR FIRST ORDER IS SPECIAL</span>

          <h2>
            Good food deserves
            <br />
            a great deal.
          </h2>

          <p>
            Enjoy exciting offers on your favourite meals.
          </p>

          <Link href="/products" className="promo-button">
            Order Now <ArrowRight size={17} />
          </Link>

        </div>

        <div className="promo-decoration">
          FOODIE
        </div>

      </section>

      {/* ======================================
          FOOTER
      ====================================== */}

      <footer className="home-footer">

        <Link href="/home" className="home-logo">
          foodie<span>.</span>
        </Link>

        <p>
          Good food. Good mood. Delivered with love.
        </p>

        <span>
          © 2026 Foodie. All rights reserved.
        </span>

      </footer>

    </main>
  );
}