"use client";

import { useEffect, useState } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedValue = localStorage.getItem(key);

      if (storedValue !== null) {
        setValue(JSON.parse(storedValue));
      }
    } catch {
      console.error("Unable to read localStorage");
    }

    setIsLoaded(true);
  }, [key]);

  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch {
        console.error("Unable to save localStorage");
      }
    }
  }, [key, value, isLoaded]);

  return [value, setValue] as const;
}