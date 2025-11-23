"use client";

import { useEffect, useState } from "react";

const useDebouncedValue = <T,>(value: T, delay: number = 300) => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedValue(value), delay);

    return () => {
      window.clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
};

export default useDebouncedValue;


