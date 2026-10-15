import type { ExecutableTask } from "../../common/index.js";
import { Task } from "../task/index.js";
import type { FlowController } from "./flow-controller.js";

/**
 * Checks if a task, or anything nested in it, ended in "error" or "cancelled".
 *
 * @param task - Task to check.
 * @returns `true` if the task needs a retry.
 */
export function needsRetry(task: ExecutableTask): boolean {
  if (task.isStatus("error", "cancelled")) {
    return true;
  }

  return !(task instanceof Task) && task.tasks.some(needsRetry);
}

/**
 * Rebuilds a {@link FlowController} for a retry, keeping task order.
 *
 * - Successful tasks stay in `completed` (same instances, so their results stay queryable).
 * - Failed and cancelled {@link Task}s are replaced by fresh clones in `pending`.
 * - {@link TaskGroup}s that need a retry are retried in place and go back to `pending`.
 * - Tasks that never ran stay in `pending`.
 *
 * @param controller - Flow controller to rebuild.
 * @param bind - Binds a cloned task to the owner's query.
 */
export function requeueForRetry(controller: FlowController, bind: (task: ExecutableTask) => ExecutableTask) {
  const kept = Array.from(controller.completed.values()).filter(({ task, valid }) => valid && !needsRetry(task));
  const keptIds = new Set(kept.map(({ task }) => task.id));

  for (const task of controller.reset()) {
    if (keptIds.has(task.id)) {
      controller.tasks.push(task);
    } else if (!needsRetry(task)) {
      controller.addTask(task);
    } else if (task instanceof Task) {
      controller.addTask(bind(task.clone()));
    } else {
      controller.addTask(task.retry());
    }
  }

  for (const entry of kept) {
    controller.completed.set(entry.task.id, entry);
  }
}
