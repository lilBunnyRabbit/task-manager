export type LogMessage = string | number | boolean | null | undefined;

export interface LogEntryInput {
  level: "debug" | "info" | "warn" | "error";
  message: LogMessage;
  meta?: any;
}

export interface LogEntry extends LogEntryInput {
  timestamp: string;
  stack?: string; // debug and error
}
