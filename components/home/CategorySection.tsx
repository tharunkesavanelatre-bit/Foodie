import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import CategoryCard from "@/features/categories/components/CategoryCard";
import SectionHeading from "@/components/ui/SectionHeading";
import { categories } from "@/data/categories";

export default function CategorySection() {
  return (
    <section className="category-section">
      <div className="category-app-container">
        <div className="category-heading">
          <SectionHeading
            badge="FOOD COLLECTION"
            title="What are you"
            highlight="craving today?"
            description="Find something delicious from our food collections."
          />

          <Link href="/categories" className="category-view-all">
            View All <ArrowUpRight size={18} />
          </Link>
        </div>

        <div className="category-app-grid">
          {categories.map((category, index) => (
            <CategoryCard
              key={category.name}
              {...category}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
