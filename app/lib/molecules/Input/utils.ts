export function formatToNumber(x: string) {
  return x.replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1');
}
