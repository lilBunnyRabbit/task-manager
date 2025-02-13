import { EventEmitter } from "@lilbunnyrabbit/event-emitter";
import type { LogEntry, LogEntryInput, LogMessage } from "./logger.type";

/**
 * Utility for managing and emitting log entries.
 */
export class Logger {
  /**
   * Creates a new logger instance.
   *
   * @param emitter - Event emitter for emitting log-related events.
   */
  constructor(private emitter: EventEmitter<{ log: LogEntry }>) {}

  /**
   * Logged entries.
   */
  readonly logs: LogEntry[] = [];

  /**
   * Stack trace of the current execution.
   *
   * @returns Stack trace as a string, or `undefined` if unavailable.
   */
  private getStack() {
    return new Error().stack?.replace(/^\w*\n\s*/, "")?.replace(/\n\s*/g, "\n");
  }

  /**
   * Adds a log entry.
   *
   * @param log - Log details including level, message, and metadata.
   * @returns Logger instance for chaining.
   * @emits log - Emits the created log entry.
   */
  public log(log: LogEntryInput) {
    const logEntry: LogEntry = {
      ...log,
      timestamp: new Date().toISOString(),
    };

    if (log.level === "debug" || log.level === "error") {
      logEntry.stack = this.getStack();
    }

    this.logs.push(logEntry);
    this.emitter.emit("log", logEntry);

    return this;
  }

  /**
   * Adds a debug-level log entry.
   *
   * @param message - Log message.
   * @param meta - Optional metadata.
   * @returns Logger instance for chaining.
   * @emits log - Emits the created log entry.
   */
  public debug(message?: LogMessage, meta?: any) {
    return this.log({ level: "debug", message, meta });
  }

  /**
   * Adds an info-level log entry.
   *
   * @param message - Log message.
   * @param meta - Optional metadata.
   * @returns Logger instance for chaining.
   * @emits log - Emits the created log entry.
   */
  public info(message?: LogMessage, meta?: any) {
    return this.log({ level: "info", message, meta });
  }

  /**
   * Adds a warning-level log entry.
   *
   * @param message - Log message.
   * @param meta - Optional metadata.
   * @returns Logger instance for chaining.
   * @emits log - Emits the created log entry.
   */
  public warn(message?: LogMessage, meta?: any) {
    return this.log({ level: "warn", message, meta });
  }

  /**
   * Adds an error-level log entry.
   *
   * @param message - Log message.
   * @param meta - Optional metadata.
   * @returns Logger instance for chaining.
   * @emits log - Emits the created log entry.
   */
  public error(message?: LogMessage, meta?: any) {
    return this.log({ level: "error", message, meta });
  }

  /**
   * Clears all logged entries.
   *
   * @returns Logger instance for chaining.
   * @emits log - Emits the created log entry.
   */
  public clear() {
    this.logs.length = 0;

    return this;
  }
}
