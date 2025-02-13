import { TaskManagerExampleCreate } from "..";

import simpleGroupMixedExample from "./simple-group-mixed.example";
import simpleGroupMixedExampleRaw from "./simple-group-mixed.example?raw";
import simpleGroupParallelExample from "./simple-group-prallel.example";
import simpleGroupParallelExampleRaw from "./simple-group-prallel.example?raw";
import simpleGroupExample from "./simple-group.example";
import simpleGroupExampleRaw from "./simple-group.example?raw";
import simpleTaskParallelExample from "./simple-task-parallel.example";
import simpleTaskParallelExampleRaw from "./simple-task-parallel.example?raw";
import simpleTaskExample from "./simple-task.example";
import simpleTaskExampleRaw from "./simple-task.example?raw";

export const examples: TaskManagerExampleCreate[] = [
  {
    id: "simple-tasks",
    title: "Simple Tasks",
    description: (
      <>
        This example demonstrates how to create a basic <code>Task</code> using <code>createTask</code> and highlights
        the process of reusing this task with different inputs. The tasks are executed sequentially using{" "}
        <code>TaskManager</code>. It also illustrates how to parse task states (<code>idle</code>,{" "}
        <code>in-progress</code>, <code>error</code>, and <code>success</code>) and log progress updates during
        execution.
      </>
    ),
    create: simpleTaskExample,
    source: simpleTaskExampleRaw,
  },
  {
    id: "simple-tasks-parallel",
    title: "Simple Tasks (Parallel)",
    description: (
      <>
        This example showcases the creation of a reusable <code>Task</code> using <code>createTask</code> and executing
        it in parallel with <code>TaskManager</code> set to <code>ExecutionMode.PARALLEL</code>. It includes task state
        parsing, detailed logging, and progress updates, demonstrating how to handle tasks running simultaneously.
      </>
    ),
    create: simpleTaskParallelExample,
    source: simpleTaskParallelExampleRaw,
  },
  {
    id: "simple-group",
    title: "Simple Group",
    description: (
      <>
        This example demonstrates how to create a <code>TaskGroup</code> using <code>createTaskGroup</code>. The task
        group encapsulates multiple instances of a <code>Task</code>, allowing them to be managed as a single unit. In
        this case, the tasks within the group are executed sequentially. The example shows how to reuse a group of tasks
        with different inputs and integrate them into a <code>TaskManager</code>.
      </>
    ),
    create: simpleGroupExample,
    source: simpleGroupExampleRaw,
  },
  {
    id: "simple-group-parallel",
    title: "Simple Group (Parallel)",
    description: (
      <>
        This example illustrates how to create a <code>TaskGroup</code> using <code>createTaskGroup</code> and set its
        execution mode to <code>ExecutionMode.PARALLEL</code>. Tasks within the group are run simultaneously, enabling
        efficient execution of multiple tasks. The example also demonstrates how to execute multiple task groups in
        parallel using <code>TaskManager</code>.
      </>
    ),
    create: simpleGroupParallelExample,
    source: simpleGroupParallelExampleRaw,
  },
  {
    id: "simple-group-mixed",
    title: "Simple Group (Mixed)",
    description: (
      <>
        This example combines different execution modes using a <code>TaskGroup</code> and demonstrates how to execute
        groups in parallel while each group handles its tasks sequentially. The example showcases how to balance
        execution strategies to achieve both parallelism and sequential processing where needed, all managed through
        <code>TaskManager</code>.
      </>
    ),
    create: simpleGroupMixedExample,
    source: simpleGroupMixedExampleRaw,
  },
];
