import type { Food } from "@/types/food";

export async function getFoods(): Promise<Food[]> {
  const response = await fetch("/api/foods");

  if (!response.ok) {
    throw new Error("Failed to fetch foods");
  }

  const result = await response.json();

  return result.data;
}