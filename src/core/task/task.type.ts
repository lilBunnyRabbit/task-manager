import type { Task } from "./task";

/**
 * Structure of a task specification.
 * @template TData - Type of the task input data.
 * @template TResult - Type of the task result data.
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
  status: string;
  /**
   * Optional result of the {@link Task}.
   */
  result?: string;
}

/**
 * Events emitted by a {@link Task}.
 */
export type TaskEvents = {
  /**
   * Emitted when task status or progress changes.
   */
  change: void;
  /**
   * Emitted when task progress updates.
   * @type {number} - New progress value.
   */
  progress: number;
};
