export function formatChartData(data: { x: string; y: number[] }[]) {
  return data.map((item) => ({
    x: new Date(item.x).getTime(),
    y: item.y.map((value) => value / 1000), // Divide each y value by 10000
  }));
}
