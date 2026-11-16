"use client";

import { useLocalStorage } from "@/hooks/useLocalStorage";

export default function LocalStorageDemo() {
  const [count, setCount] = useLocalStorage<number>(
    "foodie_demo_count",
    0
  );

  return (
    <div className="p-5">
      <h2>Foodie Visit Counter</h2>

      <p>Visits: {count}</p>

      <button
        onClick={() => setCount(count + 1)}
        className="rounded-lg bg-orange-600 px-4 py-2 text-white"
      >
        Increase Count
      </button>
    </div>
  );
}