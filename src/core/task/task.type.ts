import type { LogEntry } from "../../common/index.js";
import type { Task } from "./task.js";

/**
 * Structure for a task specification.
 * @template TData - Input data type.
 * @template TResult - Result data type.
 */
export type TaskSpec<TData = any, TResult = any> = {
  TData: TData;
  TResult: TResult;
};

/**
 * Possible statuses of a {@link Task}.
 */
export type TaskStatus = "idle" | "in-progress" | "error" | "success" | "cancelled";

/**
 * Parsed version of a {@link Task}, used for UI rendering.
 */
export interface ParsedTask {
  /**
   * Current status of the {@link Task}.
   */
  status?: string;
  /**
   * Optional result of the {@link Task}.
   */
  result?: string;
  /**
   * Optional status message of the {@link Task}.
   */
  message?: string;
}

/**
 * Automatic retry configuration for a {@link Task}.
 */
export interface TaskRetryConfig {
  /**
   * Maximum number of attempts, including the first one (`3` means one run plus up to two retries).
   */
  attempts: number;
  /**
   * How the wait between attempts grows.
   *
   * - `"fixed"`: always waits `delay_ms`.
   * - `"exponential"`: waits `delay_ms * 2 ** (attempt - 1)`, where `attempt` is the attempt that just failed.
   */
  backoff: "fixed" | "exponential";
  /**
   * Base wait between attempts in milliseconds.
   */
  delay_ms: number;
}

/**
 * Payload of the {@link Task} `retry` event.
 */
export interface TaskRetryEvent {
  /**
   * Attempt that just failed (starting at 1).
   */
  attempt: number;
  /**
   * Maximum number of attempts.
   */
  attempts: number;
  /**
   * Wait before the next attempt in milliseconds.
   */
  delay_ms: number;
  /**
   * Error thrown by the failed attempt.
   */
  error: unknown;
}

/**
 * Events emitted by {@link Task}.
 */
export type TaskEvents = {
  /**
   * Emitted when a parameter changes.
   */
  param: "status" | "progress" | "result" | "message";
  /**
   * Log entry for task events.
   */
  log: LogEntry;
  /**
   * Emitted when progress updates.
   * @type {number} - New progress value.
   */
  progress: number;
  /**
   * Emitted when the task completes successfully.
   */
  success: void;
  /**
   * Emitted when the task encounters an error.
   */
  error: any;
  /**
   * Emitted when the task is cancelled, with the abort reason.
   */
  cancel: unknown;
  /**
   * Emitted when an attempt fails and the task is about to retry.
   */
  retry: TaskRetryEvent;
};
