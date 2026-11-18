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

  // Fetch cart from database
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

    // Listen for cart changes
    window.addEventListener("fooddie-cart-change", fetchCart);

    return () => {
      window.removeEventListener("fooddie-cart-change", fetchCart);
    };
  }, []);

  // Add item
  const addItem = async (item: Omit<CartItem, "id" | "quantity">) => {
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

      window.dispatchEvent(new Event("fooddie-cart-change"));

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

    const response = await fetch(`/api/cart/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ quantity }),
    });

    if (response.ok) {
      window.dispatchEvent(new Event("fooddie-cart-change"));
    }
  };

  // Remove item
  const removeItem = async (id: string) => {
    const response = await fetch(`/api/cart/${id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      window.dispatchEvent(new Event("fooddie-cart-change"));
    }
  };

  return {
    cart,
    addItem,
    updateQuantity,
    removeItem,
    clearCart: fetchCart,
  };
}