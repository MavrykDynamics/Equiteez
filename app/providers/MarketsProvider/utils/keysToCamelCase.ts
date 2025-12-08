export function keysToCamelCase<T>(obj: T): T {
  if (Array.isArray(obj)) {
    return obj.map((v) => keysToCamelCase(v)) as T;
  } else if (obj !== null && typeof obj === "object") {
    return Object.entries(obj).reduce((acc, [key, value]) => {
      const camelKey = key.replace(/_([a-z])/g, (_, char) =>
        char.toUpperCase()
      );
      (acc as any)[camelKey] = keysToCamelCase(value);
      return acc;
    }, {} as any);
  }

  return obj;
}
