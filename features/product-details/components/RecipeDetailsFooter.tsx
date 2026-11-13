"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function RecipeDetailsFooter() {
  return (
    <section className="details-bottom">
      <h2>Ready to Discover More?</h2>

      <p>
        Explore more dishes, ingredients and food traditions with Foodie.
      </p>

      <Link href="/categories">
        <ArrowLeft size={18} />
        Explore More Recipes
      </Link>
    </section>
  );
}
