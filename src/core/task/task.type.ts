import type { EventMap } from "@lilbunnyrabbit/event-emitter";
import type { Task } from "./task";

export type TaskSpec<TData = any, TResult = any> = {
  TData: TData;
  TResult: TResult;
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
   * Optional string representing the {@link Task}'s result.
   */
  result?: string;
}

export interface TaskEvents extends EventMap {
  /**
   * Emits when anything about the task changes (status, progress, etc.).
   */
  change: void;
  /**
   * Emits when task progress is updated.
   */
  progress: number;
}
