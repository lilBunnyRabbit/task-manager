import type { ExecutableTask } from "../../common";
import type { FlowController } from "./flow-controller";

/**
 * Possible states of a task in the flow.
 */
export type FlowState = "pending" | "active" | "completed";

/**
 * Events emitted by {@link FlowController}.
 */
export type FlowControllerEvents = {
  /**
   * Emitted when a task transitions between states.
   *
   * @property from - The previous state of the task (optional).
   * @property to - The new state of the task (optional).
   * @property task - The task undergoing the state transition.
   */
  transition: { from?: FlowState; to?: FlowState; task: ExecutableTask };
};
