import type { LogEntry } from "../../common";
import type { Task } from "./task";

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
export type TaskStatus = "idle" | "in-progress" | "error" | "success";

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
}

/**
 * Events emitted by {@link Task}.
 */
export type TaskEvents = {
  /**
   * Emitted when a parameter changes.
   */
  param: "status" | "progress" | "result";
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
};
