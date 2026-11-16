"use client";

import { useState } from "react";

export function useToggle(initialValue = false) {
  const [value, setValue] = useState(initialValue);

  function toggle() {
    setValue((previous) => !previous);
  }

  return { value, toggle };
}