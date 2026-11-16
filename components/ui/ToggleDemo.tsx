"use client";

import { useToggle } from "@/hooks/useToggle";

export default function ToggleDemo() {
  const { value, toggle } = useToggle();

  return (
    <div className="p-5">
      <h2>{value ? "Menu Open" : "Menu Closed"}</h2>

      <button
        onClick={toggle}
        className="rounded-lg bg-orange-600 px-4 py-2 text-white"
      >
        Toggle Menu
      </button>
    </div>
  );
}