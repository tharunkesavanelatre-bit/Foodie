"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";

type Props = {
  id: string;
  name: string;
  price: string;
  image: string;
  category: string;
};

export default function WishlistButton({
  id,
  name,
  price,
  image,
  category,
}: Props) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function checkWishlist() {
      try {
        const response = await fetch("/api/wishlist");
        if (!response.ok) return;

        const data = await response.json();

        setIsWishlisted(
          data.items.some((item: { idMeal: string }) => item.idMeal === id)
        );
      } catch (error) {
        console.error(error);
      }
    }

    checkWishlist();
  }, [id]);

  async function handleWishlist() {
    if (loading) return;

    setLoading(true);

    try {
      const response = await fetch(
        isWishlisted ? `/api/wishlist/${id}` : "/api/wishlist",
        {
          method: isWishlisted ? "DELETE" : "POST",
          headers: { "Content-Type": "application/json" },
          ...(isWishlisted
            ? {}
            : {
                body: JSON.stringify({
                  idMeal: id,
                  strMeal: name,
                  strMealThumb: image,
                  strCategory: category,
                  price: Number(price.replace(/[^\d.]/g, "")),
                }),
              }),
        }
      );

      if (response.status === 401) {
        alert("Please login to use Wishlist.");
        return;
      }

      if (!response.ok) {
        alert("Unable to update Wishlist.");
        return;
      }

      setIsWishlisted(!isWishlisted);
    } catch (error) {
      console.error(error);
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleWishlist}
      disabled={loading}
      className="flex items-center gap-2 border border-orange-600 text-orange-600 px-6 py-3 rounded-full hover:bg-orange-50 transition disabled:opacity-50"
    >
      <Heart
        size={19}
        fill={isWishlisted ? "currentColor" : "none"}
      />
      {isWishlisted ? "Wishlisted" : "Add to Wishlist"}
    </button>
  );
}
