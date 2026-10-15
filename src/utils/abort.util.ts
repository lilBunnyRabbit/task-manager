/**
 * Creates a `DOMException` with the name `"AbortError"`.
 *
 * @param message - Error message.
 * @returns AbortError instance.
 */
export function createAbortError(message: string) {
  return new DOMException(message, "AbortError");
}

/**
 * Checks if a value is an `AbortError` (any error-like object whose `name` is `"AbortError"`).
 *
 * @param error - Value to check.
 * @returns `true` if the value is an `AbortError`.
 */
export function isAbortError(error: unknown) {
  return typeof error === "object" && error !== null && (error as { name?: unknown }).name === "AbortError";
}

/**
 * Waits for the given time, rejecting with the signal's reason as soon as the signal aborts.
 *
 * @param ms - Time to wait in milliseconds.
 * @param signal - Signal that cancels the wait.
 * @returns Promise that resolves after `ms` milliseconds.
 */
export function abortableDelay(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal.aborted) {
      return reject(signal.reason);
    }

    const onAbort = () => {
      clearTimeout(timer);
      reject(signal.reason);
    };

    const timer = setTimeout(() => {
      signal.removeEventListener("abort", onAbort);
      resolve();
    }, ms);

    signal.addEventListener("abort", onAbort, { once: true });
  });
}
