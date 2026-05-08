import { useState, useEffect } from 'react';

/**
 * Debounces a value by the given delay (ms).
 * Returns the debounced value that only updates after delay.
 */
export function useDebounce(value, delay = 400) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
