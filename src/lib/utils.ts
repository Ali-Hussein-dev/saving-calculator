import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Tailwind function to merge classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Update an array of items with a new item, if the item exists in the array, update it, otherwise add it to the array
 */
export function updateArray<T>(
  items: T[],
  newItem: T,
  keySelector: (item: T) => any
): T[] {

  const existingItemIndex = items.findIndex((item) =>
    keySelector(item) === keySelector(newItem)
  );
  if (existingItemIndex !== -1) {
    items[existingItemIndex] = newItem;
  } else {
    items.push(newItem);
  }

  return items;
}