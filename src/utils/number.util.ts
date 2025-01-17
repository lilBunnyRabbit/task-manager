export function clamp(value: number, min: number, max: number) {
  return value > max ? max : value < min ? min : value;
}

export function clamp01(value: number) {
  return clamp(value, 0, 1);
}
