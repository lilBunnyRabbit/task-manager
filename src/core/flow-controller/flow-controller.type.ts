import type { EventMap } from "@lilbunnyrabbit/event-emitter";
import type { ExecutableTask } from "../../common";
import type { FlowController } from "./flow-controller";

/**
 * Represents the possible states of a task in the flow.
 */
export type FlowState = "pending" | "active" | "completed";

/**
 * Events emitted by a {@link FlowController}.
 */
export type FlowControllerEvents = {
  transition: { from?: FlowState; to?: FlowState; task: ExecutableTask };
};
