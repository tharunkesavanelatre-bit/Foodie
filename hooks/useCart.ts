"use client";

import { useEffect, useState } from "react";

export type CartItem = {
  id: string;
  idMeal?: string | null;
  name: string;
  price: string;
  image: string;
  category?: string | null;
  quantity: number;
};

export function useCart() {
  const [cart, setCart] = useState<CartItem[]>([]);

  // Fetch cart
  const fetchCart = async () => {
    try {
      const response = await fetch("/api/cart", {
        cache: "no-store",
      });

      if (!response.ok) {
        setCart([]);
        return;
      }

      const data = await response.json();
      setCart(data.items);
    } catch (error) {
      console.error("Cart fetch error:", error);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // Add item
  const addItem = async (
    item: Omit<CartItem, "id" | "quantity">
  ) => {
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(item),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to add item.");
      }

      const savedItem: CartItem = data.item;

      setCart((current) => {
        const exists = current.some(
          (food) => food.id === savedItem.id
        );

        if (exists) {
          return current.map((food) =>
            food.id === savedItem.id ? savedItem : food
          );
        }

        return [...current, savedItem];
      });

      return true;
    } catch (error) {
      console.error("Add cart error:", error);
      return false;
    }
  };

  // Update quantity
  const updateQuantity = async (id: string, quantity: number) => {
    if (quantity <= 0) {
      await removeItem(id);
      return;
    }

    await fetch(`/api/cart/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ quantity }),
    });

    await fetchCart();
  };

  // Remove item
  const removeItem = async (id: string) => {
    await fetch(`/api/cart/${id}`, {
      method: "DELETE",
    });

    await fetchCart();
  };

  return {
    cart,
    addItem,
    updateQuantity,
    removeItem,
    clearCart: fetchCart,
  };
}