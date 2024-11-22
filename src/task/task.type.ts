import type { Task } from "./task";

export type TaskSpec<TData = unknown, TResult = unknown, TError = any> = {
  TData: TData;
  TResult: TResult;
  TError: TError;
};

/**
 * Possible statuses of a {@link Task}.
 */
export type TaskStatus = "idle" | "in-progress" | "error" | "success";

/**
 * Represents a parsed version of a {@link Task}, typically used for rendering in a UI.
 */
export interface ParsedTask {
  /**
   * {@link Task}'s current status as a string.
   */
  status: string;
  /**
   * Optional array of warnings related to the {@link Task}.
   */
  warnings?: string[];
  /**
   * Optional array of errors related to the {@link Task}.
   */
  errors?: string[];
  /**
   * Optional string representing the {@link Task}'s result.
   */
  result?: string;
}
