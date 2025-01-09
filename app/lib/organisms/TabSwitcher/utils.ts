export function getGliderDistance(idx: number, gap: number) {
  return idx === 0 ? "0%" : `calc((${idx} * 100%) + (${idx} * ${gap}px))`;
}
