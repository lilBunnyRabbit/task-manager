import type { Task } from "./task";

export type TaskSpec<TData = any, TResult = any, TError = any> = {
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
export interface ParsedTask<TType = string> {
  /**
   * {@link Task}'s current status as a string.
   */
  status: TType | string;
  /**
   * Optional array of warnings related to the {@link Task}.
   */
  warnings?: TType[] | string[];
  /**
   * Optional array of errors related to the {@link Task}.
   */
  errors?: TType[] | string[];
  /**
   * Optional string representing the {@link Task}'s result.
   */
  result?: TType | string;
}
