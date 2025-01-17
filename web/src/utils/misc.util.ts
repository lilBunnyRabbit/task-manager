export function parseProgress(value: number) {
  return `${Math.round(value * 10000) / 100} %`;
}

export function safelyParseJson(value: unknown) {
  try {
    return JSON.stringify(value);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_) {
    return String(value);
  }
}
