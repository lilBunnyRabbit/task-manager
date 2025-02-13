import { TaskManagerExampleCreate } from "..";

import taskGroupContinue_on_errorExample from "./task-group-continue_on_error.example";
import taskGroupContinue_on_errorExampleRaw from "./task-group-continue_on_error.example?raw";
import taskManagerContinue_on_errorExample from "./task-manager-continue_on_error.example";
import taskManagerContinue_on_errorExampleRaw from "./task-manager-continue_on_error.example?raw";

export const examples: TaskManagerExampleCreate[] = [
  {
    id: "flag-continue-on-error-task-manager",
    title: "CONTINUE_ON_ERROR (TaskManager)",
    description: (
      <>
        This example demonstrates how to use the <code>CONTINUE_ON_ERROR</code> flag in a <code>TaskManager</code>. It
        shows how the flag allows the manager to continue executing subsequent tasks even if one of them fails. This is
        useful for scenarios where tasks are independent, and partial success is acceptable.
      </>
    ),
    create: taskManagerContinue_on_errorExample,
    source: taskManagerContinue_on_errorExampleRaw,
  },
  {
    id: "flag-continue-on-error-task-group",
    title: "CONTINUE_ON_ERROR (TaskGroup)",
    description: (
      <>
        This example illustrates how to use the <code>CONTINUE_ON_ERROR</code> flag in a <code>TaskGroup</code>. It
        highlights how the flag enables the group to execute all tasks, even if one or more tasks fail, ensuring that
        the group completes as many tasks as possible without interruption.
      </>
    ),
    create: taskGroupContinue_on_errorExample,
    source: taskGroupContinue_on_errorExampleRaw,
  },
];
