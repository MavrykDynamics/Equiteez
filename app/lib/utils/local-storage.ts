/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unnecessary-type-constraint */
import { ZodType, z } from 'zod';

// check if fetched item from local storage is simple string
function isSimpleString(item: string) {
  // eslint-disable-next-line no-useless-escape
  const simpleStringPattern = /^[^{\[\]{}]*$/;
  return simpleStringPattern.test(item);
}

/**
 *
 * @param item string that reperesent key in local storage you wanna get
 * @param schema optional parameter to parse value from local storage
 * @returns item from localStorage | null
 */
export const getItemFromStorage = <T extends unknown>(
  item: string,
  schema: ZodType<T, any> = z.any()
): T | null => {
  try {
    const itemFromStorage = localStorage.getItem(item);

    /**
     * if item is string representing null OR undefined OR just null -> return null
     */
    if (
      (typeof itemFromStorage === 'string' &&
        (itemFromStorage === 'undefined' || itemFromStorage === 'null')) ||
      itemFromStorage === null
    )
      return null;

    /**
     * if item is simple string -> return the value as it is
     */
    if (isSimpleString(itemFromStorage)) return itemFromStorage as T;

    return itemFromStorage ? schema.parse(JSON.parse(itemFromStorage)) : null;
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const setItemInStorage = (item: string, value: unknown): boolean => {
  try {
    localStorage.setItem(item, JSON.stringify(value));
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
};

export const removeItemFromStorage = (item: string) => {
  localStorage.removeItem(item);
};
