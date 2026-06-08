/** From lodash */
type Truthy<T> = T extends null | undefined | void | false | "" | 0 | 0n
  ? never
  : T;

export const isTruthy = <T>(value: T): value is Truthy<T> => Boolean(value);

/** With strict equality check (i.e. `===`) */
export const filterUnique = <T>(array: T[]) => Array.from(new Set(array));

const DEFAULT_DELAY = 300;

export const delay = (ms = DEFAULT_DELAY) =>
  new Promise((res) => setTimeout(res, ms));

export const isDefined = <T>(value: T | null | undefined): value is T =>
  value !== undefined && value !== null;

export function mapValuesToArray<K, V>(map: Map<K, V>): V[] {
  return Array.from(map.values());
}

export function withSortedFromMap<K, V>(map: Map<K, V>, sortedKeys: K[]): V[] {
  const seen = new Set<K>();
  const sortedValues: V[] = [];

  for (const key of sortedKeys) {
    const value = map.get(key);
    if (value !== undefined) {
      sortedValues.push(value);
      seen.add(key);
    }
  }

  for (const [key, value] of map) {
    if (!seen.has(key)) {
      sortedValues.push(value);
    }
  }

  return sortedValues;
}
