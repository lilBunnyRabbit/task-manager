import { TaskManager } from "@lilbunnyrabbit/task-manager";

import calculationExample from "./calculation-example";
import calculationExampleRaw from "./calculation-example?raw";
import groupParallelExample from "./group-parallel-example";
import groupParallelExampleFail from "./group-parallel-example-fail";
import groupParallelExampleFailRaw from "./group-parallel-example-fail?raw";
import groupParallelExampleRaw from "./group-parallel-example?raw";
import prallelExample from "./prallel-example";
import prallelExampleFail from "./prallel-example-fail";
import prallelExampleFailRaw from "./prallel-example-fail?raw";
import prallelExampleRaw from "./prallel-example?raw";

export interface TaskManagerExampleCreate {
  title: string;
  description: string;
  create: () => TaskManager;
  source: string;
}

export interface TaskManagerExample {
  title: string;
  description: string;
  taskManager: TaskManager;
  source: string;
}

export const examples: TaskManagerExampleCreate[] = [
  {
    title: "Calculation Example",
    description: "",
    create: calculationExample,
    source: calculationExampleRaw,
  },
  {
    title: "Parallel Example",
    description: "",
    create: prallelExample,
    source: prallelExampleRaw,
  },
  {
    title: "Parallel Example (Fail)",
    description: "",
    create: prallelExampleFail,
    source: prallelExampleFailRaw,
  },
  {
    title: "Group Parallel Example",
    description: "",
    create: groupParallelExample,
    source: groupParallelExampleRaw,
  },
  {
    title: "Group Parallel Example (Fail)",
    description: "",
    create: groupParallelExampleFail,
    source: groupParallelExampleFailRaw,
  },
];
