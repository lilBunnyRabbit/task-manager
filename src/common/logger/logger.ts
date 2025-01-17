import { EventEmitter } from "@lilbunnyrabbit/event-emitter";
import type { LogEntry, LogEntryInput, LogMessage } from "./logger.type";

/**
 * Logger utility for capturing and managing log entries.
 */
export class Logger {
  constructor(private emitter: EventEmitter<{ log: LogEntry }>) {}

  /**
   * Array of logged entries.
   */
  readonly logs: LogEntry[] = [];

  /**
   * Retrieves the current stack trace.
   *
   * @returns The stack trace as a string, or `undefined` if unavailable.
   */
  private getStack() {
    return new Error().stack?.replace(/^\w*\n\s*/, "")?.replace(/\n\s*/g, "\n");
  }

  /**
   * Logs a new entry with the specified details.
   *
   * @param log - The log entry input, including level, message, and optional metadata.
   * @returns The instance of the logger for chaining.
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
   * Logs a debug-level message.
   *
   * @param message - The log message.
   * @param meta - Optional metadata associated with the log.
   * @returns The instance of the logger for chaining.
   */
  public debug(message?: LogMessage, meta?: any) {
    return this.log({ level: "debug", message, meta });
  }

  /**
   * Logs an info-level message.
   *
   * @param message - The log message.
   * @param meta - Optional metadata associated with the log.
   * @returns The instance of the logger for chaining.
   */
  public info(message?: LogMessage, meta?: any) {
    return this.log({ level: "info", message, meta });
  }

  /**
   * Logs a warning-level message.
   *
   * @param message - The log message.
   * @param meta - Optional metadata associated with the log.
   * @returns The instance of the logger for chaining.
   */
  public warn(message?: LogMessage, meta?: any) {
    return this.log({ level: "warn", message, meta });
  }

  /**
   * Logs an error-level message.
   *
   * @param message - The log message.
   * @param meta - Optional metadata associated with the log.
   * @returns The instance of the logger for chaining.
   */
  public error(message?: LogMessage, meta?: any) {
    return this.log({ level: "error", message, meta });
  }

  /**
   * Clears all log entries.
   *
   * @returns The instance of the logger for chaining.
   */
  public clear() {
    this.logs.length = 0;

    return this;
  }
}
