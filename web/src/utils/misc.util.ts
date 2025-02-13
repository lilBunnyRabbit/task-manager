export function parseProgress(value: number) {
  return `${Math.round(value * 10000) / 100} %`;
}

export function safelyParseJson(value: unknown): string {
  try {
    if (typeof value === "object" && value !== null) {
      // Iterate one level deep
      const shallowObject: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        // Stringify nested objects/arrays or retain primitive types
        shallowObject[key] = typeof val === "object" && val !== null ? String(val) : val;
      }
      return JSON.stringify(shallowObject);
    }
    return JSON.stringify(value); // Handle primitives or null
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_) {
    return String(value); // Fallback to simple string conversion
  }
}
