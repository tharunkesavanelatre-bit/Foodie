"use client";

import { useEffect, useState } from "react";
import { Sparkles, Search, SlidersHorizontal } from "lucide-react";

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
    if (category) setSelectedCategory(category);
  }, []);

  const categories = [...new Set(foods.map((food) => food.category))];

  const filteredFoods = foods.filter((food) => {
    const matchesCategory =
      selectedCategory === "All" ||
      food.category === selectedCategory;

    const matchesSearch = food.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const sortedFoods = [...filteredFoods].sort((a, b) => {
    if (sortOption === "low") {
      return (
        Number(a.price.replace(/\D/g, "")) -
        Number(b.price.replace(/\D/g, ""))
      );
    }

    if (sortOption === "high") {
      return (
        Number(b.price.replace(/\D/g, "")) -
        Number(a.price.replace(/\D/g, ""))
      );
    }

    if (sortOption === "name") {
      return a.name.localeCompare(b.name);
    }

    return 0;
  });

  return (
    <main className="products-page">
      <section className="products-hero">
        <span className="products-badge">
          <Sparkles size={15} />
          YOUR FOOD DISCOVERY
        </span>

        <h1>
          Explore <span>Delicious Foods</span>
        </h1>

        <p>
          Discover your next favourite meal from our delicious
          food collection.
        </p>

        <div className="products-search">
          <Search size={19} />
          <input
            type="text"
            placeholder="Search your favourite food..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>
      </section>

      <section className="products-content">
        <div className="products-toolbar">
          <div>
            <span className="products-toolbar-label">
              <SlidersHorizontal size={16} />
              FOOD COLLECTION
            </span>
            <h2>
              {selectedCategory === "All"
                ? "All Foods"
                : selectedCategory}
            </h2>
            <p>{sortedFoods.length} delicious choices available</p>
          </div>

          <select
            value={sortOption}
            onChange={(event) => setSortOption(event.target.value)}
            className="products-sort"
          >
            <option value="default">Default Sorting</option>
            <option value="low">Price: Low to High</option>
            <option value="high">Price: High to Low</option>
            <option value="name">Name: A to Z</option>
          </select>
        </div>

        <div className="products-category-filter">
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
        </div>

        <div className="popular-food-grid products-food-grid">
          {sortedFoods.map((food, index) => (
            <div
              key={food.name}
              className="products-food-item"
              style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
            >
              <FoodCard {...food} />
            </div>
          ))}
        </div>

        {sortedFoods.length === 0 && (
          <div className="products-empty">
            <Search size={35} />
            <h3>No matching foods found</h3>
            <p>Try another search or choose a different category.</p>
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("All");
              }}
            >
              Clear Filters
            </button>
          </div>
        )}
      </section>
    </main>
  );
}