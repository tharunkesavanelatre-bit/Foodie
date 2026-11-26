"use client";

import { useEffect, useRef, useState } from "react";

export type CartItem = {
  id: string;
  foodId?: string | null;
  idMeal?: string | null;
  name: string;
  price: string;
  image: string;
  category?: string | null;
  quantity: number;
};

export function useCart() {
  const [cart, setCart] = useState<CartItem[]>([]);

  // Track the latest update for each cart item.
  const latestUpdateRef = useRef(new Map<string, number>());

  // Keep database updates in order.
  const updateQueueRef = useRef(
    new Map<string, Promise<void>>()
  );

  // Fetch cart from database
  const fetchCart = async () => {
    try {
      const response = await fetch("/api/cart", {
        cache: "no-store",
      });

      if (!response.ok) {
        return;
      }

      const data = await response.json();

      if (Array.isArray(data.items)) {
        setCart(data.items);
      }
    } catch (error) {
      console.error("Cart fetch error:", error);
    }
  };

  useEffect(() => {
    fetchCart();

    window.addEventListener("fooddie-cart-change", fetchCart);

    return () => {
      window.removeEventListener("fooddie-cart-change", fetchCart);
    };
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

      window.dispatchEvent(new Event("fooddie-cart-change"));

      return true;
    } catch (error) {
      console.error("Add cart error:", error);
      return false;
    }
  };

  // Update quantity immediately
  const updateQuantity = async (
    id: string,
    quantity: number
  ) => {
    // Handle item removal
    if (quantity <= 0) {
      await removeItem(id);
      return;
    }

    // 1. Update the UI immediately
    setCart((currentCart) =>
      currentCart.map((item) =>
        item.id === id
          ? { ...item, quantity }
          : item
      )
    );

    // 2. Track the latest requested quantity
    const version =
      (latestUpdateRef.current.get(id) ?? 0) + 1;

    latestUpdateRef.current.set(id, version);

    // 3. Queue the database update
    const previousRequest =
      updateQueueRef.current.get(id) ?? Promise.resolve();

    const request = previousRequest
      .catch(() => {})
      .then(async () => {
        // Skip outdated updates
        if (latestUpdateRef.current.get(id) !== version) {
          return;
        }

        const response = await fetch(`/api/cart/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ quantity }),
        });

        if (!response.ok) {
          throw new Error("Unable to update cart quantity.");
        }

        // Notify other components only for the latest update
        if (latestUpdateRef.current.get(id) === version) {
          window.dispatchEvent(
            new Event("fooddie-cart-change")
          );
        }
      })
      .catch(async (error) => {
        console.error("Update quantity error:", error);

        // Restore the database cart if the latest update fails
        if (latestUpdateRef.current.get(id) === version) {
          await fetchCart();
        }
      });

    updateQueueRef.current.set(id, request);

    await request;
  };

  // Remove item
  const removeItem = async (id: string) => {
    // Update UI immediately
    setCart((currentCart) =>
      currentCart.filter((item) => item.id !== id)
    );

    const version =
      (latestUpdateRef.current.get(id) ?? 0) + 1;

    latestUpdateRef.current.set(id, version);

    const previousRequest =
      updateQueueRef.current.get(id) ?? Promise.resolve();

    const request = previousRequest
      .catch(() => {})
      .then(async () => {
        if (latestUpdateRef.current.get(id) !== version) {
          return;
        }

        const response = await fetch(`/api/cart/${id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Unable to remove cart item.");
        }

        if (latestUpdateRef.current.get(id) === version) {
          window.dispatchEvent(
            new Event("fooddie-cart-change")
          );
        }
      })
      .catch(async (error) => {
        console.error("Remove cart error:", error);

        if (latestUpdateRef.current.get(id) === version) {
          await fetchCart();
        }
      });

    updateQueueRef.current.set(id, request);

    await request;
  };

  return {
    cart,
    addItem,
    updateQuantity,
    removeItem,
    clearCart: fetchCart,
  };
}