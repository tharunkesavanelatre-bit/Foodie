"use client";

import { ShoppingCart } from "lucide-react";
import { useCart } from "@/hooks/useCart";

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

  const handleAddToCart = () => {
    addItem({ name, price, image });
    alert(`${name} added to cart!`);
  };

  return (
    <button
      onClick={handleAddToCart}
      className="flex items-center gap-2 bg-orange-600 text-white px-8 py-3 rounded-full hover:bg-orange-700 transition"
    >
      <ShoppingCart size={19} />
      Add to Cart
    </button>
  );
}