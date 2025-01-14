/**
 * Represents a log message, which can be a string, number, boolean, or null/undefined.
 */
export type LogMessage = string | number | boolean | null | undefined;

/**
 * Input for creating a log entry.
 */
export interface LogEntryInput {
  /**
   * Log level indicating the severity of the log.
   */
  level: "debug" | "info" | "warn" | "error";
  /**
   * The message associated with the log entry.
   */
  message: LogMessage;
  /**
   * Optional metadata associated with the log entry.
   */
  meta?: any;
}

/**
 * Represents a complete log entry, including a timestamp and optional stack trace.
 */
export interface LogEntry extends LogEntryInput {
  /**
   * ISO-formatted timestamp indicating when the log was created.
   */
  timestamp: string;
  /**
   * Stack trace information, available for "debug" and "error" levels.
   */
  stack?: string;
}
