"use client";

import { useState } from "react";
import { ShoppingCart, Loader2 } from "lucide-react";

import { useCart } from "@/hooks/useCart";
import { useToast } from "@/components/ui/ToastProvider";

type Props = {
  name: string;
  price: string;
  image: string;
};

export default function AddToCartButton({
  name,
  price,
  image,
}: Props) {
  const { addItem } = useCart();
  const { showToast } = useToast();

  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async () => {
    if (isAdding) return;

    setIsAdding(true);

    showToast(
      `${name} added to your cart successfully!`,
      "success"
    );

    try {
      await addItem({ name, price, image });
    } catch {
      showToast(
        `Unable to add ${name} to your cart. Please try again.`,
        "error"
      );
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleAddToCart}
      disabled={isAdding}
      className="flex items-center gap-2 rounded-full bg-orange-600 px-8 py-3 text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isAdding ? (
        <Loader2 size={19} className="animate-spin" />
      ) : (
        <ShoppingCart size={19} />
      )}

      {isAdding ? "Adding..." : "Add to Cart"}
    </button>
  );
}
