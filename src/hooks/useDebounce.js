import { useState, useEffect } from 'react'

/**
 * Custom hook to debounce rapid state updates (e.g. search input fields)
 * Prevents CPU thrashing and excessive filter re-renders on large rosters.
 * @param {any} value 
 * @param {number} delay (ms)
 * @returns {any} debouncedValue
 */
export const useDebounce = (value, delay = 250) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

export default useDebounce
