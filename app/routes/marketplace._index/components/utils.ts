export function calculateDynamicRanges(arr: number[]) {
  const range = arr.length < 4 ? arr.length - 1 : 4;

  // Sort the array to ensure it is in ascending order
  arr.sort((a, b) => a - b);

  // Get the minimum and maximum values
  const min = arr[0];
  const max = arr[arr.length - 1];

  // Calculate the step size for each range
  const step = (max - min) / range;

  // Create the ranges
  const ranges: Record<string, { min: number; max: number }> = {};
  for (let i = 0; i < range; i++) {
    const start = min + i * step;
    const end = i === 3 ? max : start + step;
    ranges[`${start?.toFixed(2)}% - ${end?.toFixed(2)}%`] = {
      min: start,
      max: end,
    };
  }

  return ranges;
}
