import { Sparkles } from "lucide-react";

import { categories } from "@/data/categories";
import CategoryCard from "@/features/categories/components/CategoryCard";

export default function CategoriesPage() {
  return (
    <main className="category-page">
      <section className="category-page-hero">
        <span className="category-page-badge">
          <Sparkles size={15} />
          DISCOVER YOUR FAVOURITES
        </span>

        <h1>
          Explore Food <span>Categories</span>
        </h1>

        <p>
          From everyday favourites to exciting new flavours,
          find something delicious for every craving.
        </p>

        <div className="category-page-count">
          <strong>{categories.length}</strong>
          <span>Food Collections</span>
        </div>
      </section>

      <section className="category-page-content">
        <div className="category-page-grid">
          {categories.map((category, index) => (
            <CategoryCard
              key={category.name}
              {...category}
              index={index}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
