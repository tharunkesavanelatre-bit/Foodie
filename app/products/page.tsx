"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  SlidersHorizontal,
  Utensils,
  X,
  RotateCcw,
  ArrowDownWideNarrow,
  ArrowRight,
} from "lucide-react";

import "./products.css";

import { foods } from "@/data/foods";
import FoodCard from "@/features/products/components/FoodCard";
import CategoryFilter from "@/features/products/components/CategoryFilter";

export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("default");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    setSearchTerm(params.get("q") || "");

    const category = params.get("category");

    if (category) {
      setSelectedCategory(category);
    }
  }, []);

  const categories = useMemo(
    () => [...new Set(foods.map((food) => food.category))],
    []
  );

  const filteredFoods = useMemo(() => {
    const search = searchTerm.toLowerCase().trim();

    return foods.filter((food) => {
      const matchesCategory =
        selectedCategory === "All" ||
        food.category === selectedCategory;

      const matchesSearch =
        food.name.toLowerCase().includes(search) ||
        food.category.toLowerCase().includes(search) ||
        food.tag.toLowerCase().includes(search);

      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchTerm]);

  const sortedFoods = useMemo(() => {
    return [...filteredFoods].sort((a, b) => {
      const priceA = Number(a.price.replace(/[^\d.]/g, ""));
      const priceB = Number(b.price.replace(/[^\d.]/g, ""));

      switch (sortOption) {
        case "low":
          return priceA - priceB;
        case "high":
          return priceB - priceA;
        case "name":
          return a.name.localeCompare(b.name);
        case "rating":
          return Number(b.rating) - Number(a.rating);
        default:
          return 0;
      }
    });
  }, [filteredFoods, sortOption]);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("All");
    setSortOption("default");
  };

  const hasActiveFilters =
    searchTerm.trim() !== "" || selectedCategory !== "All";

  return (
    <main className="products-page">

      {/* EDITORIAL HERO */}
      <section className="products-hero">
        <div className="products-hero-inner">
          <div className="products-hero-copy">
            <span className="products-eyebrow">
              <span className="products-eyebrow-line" />
              GOOD FOOD. GOOD MOOD.
            </span>

            <h1>
              A little taste
              <br />
              of <span>happiness.</span>
            </h1>

            <p>
              Discover something delicious today. From comforting
              classics to exciting new flavours, your next favourite
              meal is waiting.
            </p>

            <a href="#food-collection" className="products-explore-link">
              Explore the collection
              <ArrowRight size={17} />
            </a>
          </div>

          <div className="products-hero-visual">
            <div className="products-hero-image">
              <img
                src="https://images.unsplash.com/photo-1547592180-85f173990554?w=1100&q=90"
                alt="Freshly prepared delicious food"
              />
            </div>

            <div className="products-image-caption">
              <span>MADE FOR YOUR CRAVINGS</span>
              <strong>Something delicious, every day.</strong>
            </div>

            <div className="products-hero-decoration" />
          </div>
        </div>
      </section>

      {/* COLLECTION */}
      <section className="products-content" id="food-collection">

        {/* INTRODUCTION */}
        <div className="products-section-heading">
          <div>
            <span className="products-section-label">
              THE FOOD COLLECTION
            </span>

            <h2>
              Find your <span>favourite.</span>
            </h2>

            <p>
              Carefully picked flavours for every craving.
            </p>
          </div>

          <div className="products-collection-count">
            <strong>{sortedFoods.length}</strong>
            <span>Items available</span>
          </div>
        </div>

        {/* SEARCH AND SORT */}
        <div className="products-control-bar">
          <div className="products-search">
            <Search size={19} />

            <input
              type="search"
              placeholder="What are you craving today?"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />

            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                aria-label="Clear search"
              >
                <X size={17} />
              </button>
            )}
          </div>

          <div className="products-sort-wrapper">
            <SlidersHorizontal size={17} />

            <span>Sort by</span>

            <select
              value={sortOption}
              onChange={(event) => setSortOption(event.target.value)}
              className="products-sort"
              aria-label="Sort foods"
            >
              <option value="default">Recommended</option>
              <option value="low">Price: Low to High</option>
              <option value="high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="name">Name: A to Z</option>
            </select>
          </div>
        </div>

        {/* CATEGORIES */}
        <div className="products-category-section">
          <div className="products-category-heading">
            <h3>Browse by category</h3>
            <span>{categories.length} categories</span>
          </div>

          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
        </div>

        {/* ACTIVE FILTERS */}
        {hasActiveFilters && (
          <div className="products-active-filters">
            <span>Filtered by</span>

            {selectedCategory !== "All" && (
              <button onClick={() => setSelectedCategory("All")}>
                {selectedCategory}
                <X size={13} />
              </button>
            )}

            {searchTerm && (
              <button onClick={() => setSearchTerm("")}>
                {searchTerm}
                <X size={13} />
              </button>
            )}

            <button
              className="products-reset"
              onClick={clearFilters}
            >
              <RotateCcw size={13} />
              Reset
            </button>
          </div>
        )}

        {/* FOOD RESULTS */}
        <div className="products-results-heading">
          <div>
            <h3>
              {selectedCategory === "All"
                ? "All delicious things"
                : selectedCategory}
            </h3>

            <p>
              Showing {sortedFoods.length} of {foods.length} dishes
            </p>
          </div>

          <span className="products-results-icon">
            <Utensils size={18} />
          </span>
        </div>

        {sortedFoods.length > 0 ? (
          <div className="popular-food-grid products-food-grid">
            {sortedFoods.map((food, index) => (
              <div
                key={food.name}
                className="products-food-item"
                style={{
                  animationDelay: `${Math.min(index, 8) * 50}ms`,
                }}
              >
                <FoodCard {...food} />
              </div>
            ))}
          </div>
        ) : (
          <div className="products-empty">
            <div className="products-empty-icon">
              <Search size={30} />
            </div>

            <h3>Nothing delicious found.</h3>

            <p>
              Try another search or browse our complete food collection.
            </p>

            <button onClick={clearFilters}>
              <RotateCcw size={15} />
              Clear all filters
            </button>
          </div>
        )}
      </section>
    </main>
  );
}