"use client";

import { useEffect, useState } from "react";
import type { Food } from "@/types/food";
import { getFoods } from "@/services/foodService";

export default function FoodServiceDemo() {
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFoods() {
      try {
        const data = await getFoods();
        setFoods(data);
      } catch (error) {
        console.error("Unable to load foods:", error);
      } finally {
        setLoading(false);
      }
    }

    loadFoods();
  }, []);

  if (loading) {
    return <p>Loading foods...</p>;
  }

  return (
    <div>
      <h2>Available Foods</h2>

      {foods.map((food) => (
        <p key={food.name}>
          {food.name} - {food.price}
        </p>
      ))}
    </div>
  );
}