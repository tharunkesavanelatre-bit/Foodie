"use client";

import { Check, Grid2X2 } from "lucide-react";

type CategoryFilterProps = {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
};

export default function CategoryFilter({
  categories,
  selectedCategory,
  onCategoryChange,
}: CategoryFilterProps) {
  const allCategories = ["All", ...categories];

  return (
    <div className="products-category-filter">
      {allCategories.map((category) => {
        const isActive = selectedCategory === category;

        return (
          <button
            key={category}
            type="button"
            onClick={() => onCategoryChange(category)}
            className={`products-category-pill ${
              isActive ? "active" : ""
            }`}
            aria-pressed={isActive}
          >
            {category === "All" && <Grid2X2 size={15} />}

            <span>{category}</span>

            {isActive && <Check size={14} />}
          </button>
        );
      })}
    </div>
  );
}