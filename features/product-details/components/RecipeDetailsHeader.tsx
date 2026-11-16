"use client";

import Link from "next/link";
import { ArrowLeft, ChefHat } from "lucide-react";

export default function RecipeDetailsHeader() {
  return (
    <header className="details-header">
      <Link href="/home" className="details-brand">
        <ChefHat size={27} />
        <span>Foodie</span>
      </Link>

      <nav
        className="details-navigation"
        aria-label="Food navigation"
      >
        <Link href="/categories" className="details-back">
          <ArrowLeft size={18} />
          Back to Categories
        </Link>
      </nav>
    </header>
  );
}
