export function parseProgress(value: number) {
  return `${Math.round(value * 10000) / 100} %`
}