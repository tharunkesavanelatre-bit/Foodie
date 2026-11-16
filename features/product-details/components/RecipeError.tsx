"use client";

import { ArrowLeft, AlertCircle } from "lucide-react";

interface RecipeErrorProps {
  error: string;
  onBack: () => void;
}

export default function RecipeError({
  error,
  onBack,
}: RecipeErrorProps) {
  return (
    <main className="product-details-page">
      <div className="details-error">
        <AlertCircle size={48} />

        <h2>Recipe Not Found</h2>

        <p>{error || "Unable to find this recipe."}</p>

        <button type="button" onClick={onBack}>
          <ArrowLeft size={18} />
          Back to Categories
        </button>

        <button
          type="button"
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    </main>
  );
}
