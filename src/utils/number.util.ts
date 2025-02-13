/**
 * Clamps a number within the specified range.
 *
 * @param value - The number to clamp.
 * @param min - The minimum allowable value.
 * @param max - The maximum allowable value.
 * @returns The clamped value.
 */
export function clamp(value: number, min: number, max: number) {
  return value > max ? max : value < min ? min : value;
}

/**
 * Clamps a number between 0 and 1.
 *
 * @param value - The number to clamp.
 * @returns The clamped value between 0 and 1.
 */
export function clamp01(value: number) {
  return clamp(value, 0, 1);
}
