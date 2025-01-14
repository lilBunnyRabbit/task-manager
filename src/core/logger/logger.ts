import { LogEntry, LogEntryInput, LogMessage } from "./logger.type";

export class Logger {
  readonly logs: LogEntry[] = [];

  private getStack() {
    return new Error().stack?.replace(/^\w*\n\s*/, "")?.replace(/\n\s*/g, "\n");
  }

  public log(log: LogEntryInput) {
    const logEntry: LogEntry = {
      ...log,
      timestamp: new Date().toISOString(),
    };

    if (log.level === "debug" || log.level === "error") {
      logEntry.stack = this.getStack();
    }

    this.logs.push(logEntry);

    return this;
  }

  public debug(message?: LogMessage, meta?: any) {
    return this.log({ level: "debug", message, meta });
  }

  public info(message?: LogMessage, meta?: any) {
    return this.log({ level: "info", message, meta });
  }

  public warn(message?: LogMessage, meta?: any) {
    return this.log({ level: "warn", message, meta });
  }

  public error(message?: LogMessage, meta?: any) {
    return this.log({ level: "error", message, meta });
  }

  public clear() {
    this.logs.length = 0;

    return this;
  }
}
