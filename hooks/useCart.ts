"use client";

import { useEffect, useState } from "react";

export type CartItem = {
  name: string;
  price: string;
  image: string;
  quantity: number;
};

const STORAGE_KEY = "fooddie_cart";

function getCart(): CartItem[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveCart(cart: CartItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  window.dispatchEvent(new Event("fooddie-cart-updated"));
}

export function useCart() {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const updateCart = () => setCart(getCart());

    updateCart();
    window.addEventListener("fooddie-cart-updated", updateCart);

    return () =>
      window.removeEventListener("fooddie-cart-updated", updateCart);
  }, []);

  const addItem = (item: Omit<CartItem, "quantity">) => {
    const currentCart = getCart();
    const existing = currentCart.find((food) => food.name === item.name);

    const updatedCart = existing
      ? currentCart.map((food) =>
          food.name === item.name
            ? { ...food, quantity: food.quantity + 1 }
            : food
        )
      : [...currentCart, { ...item, quantity: 1 }];

    saveCart(updatedCart);
  };

  const updateQuantity = (name: string, quantity: number) => {
    const updatedCart = getCart()
      .map((food) =>
        food.name === name ? { ...food, quantity } : food
      )
      .filter((food) => food.quantity > 0);

    saveCart(updatedCart);
  };

  const removeItem = (name: string) => {
    saveCart(getCart().filter((food) => food.name !== name));
  };

  const clearCart = () => {
    saveCart([]);
  };

  return { cart, addItem, updateQuantity, removeItem, clearCart };
}