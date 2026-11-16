"use client";

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
  return (
    <div className="flex flex-wrap gap-3">
      <button
        onClick={() => onCategoryChange("All")}
        className={selectedCategory === "All" ? "bg-orange-600 text-white px-4 py-2 rounded-full" : "bg-white px-4 py-2 rounded-full"}
      >
        All
      </button>

      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onCategoryChange(category)}
          className={selectedCategory === category ? "bg-orange-600 text-white px-4 py-2 rounded-full" : "bg-white px-4 py-2 rounded-full"}
        >
          {category}
        </button>
      ))}
    </div>
  );
}