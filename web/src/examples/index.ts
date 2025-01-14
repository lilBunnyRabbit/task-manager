import { TaskManager } from "@package/index";

import calculationExample from "./calculation-example";
import calculationExampleRaw from "./calculation-example?raw";
import prallelExample from "./prallel-example";
import prallelExampleRaw from "./prallel-example?raw";
import prallelExampleFail from "./prallel-example-fail";
import prallelExampleFailRaw from "./prallel-example-fail?raw";
import groupParallelExample from "./group-parallel-example";
import groupParallelExampleRaw from "./group-parallel-example?raw";

export interface TaskManagerExampleCreate {
  title: string;
  description: string;
  create: () => TaskManager;
  raw: string;
}

export interface TaskManagerExample {
  title: string;
  description: string;
  taskManager: TaskManager;
  raw: string;
}

export const examples: TaskManagerExampleCreate[] = [
  {
    title: "Calculation Example",
    description: "",
    create: calculationExample,
    raw: calculationExampleRaw,
  },
  {
    title: "Parallel Example",
    description: "",
    create: prallelExample,
    raw: prallelExampleRaw,
  },
  {
    title: "Parallel Example (Fail)",
    description: "",
    create: prallelExampleFail,
    raw: prallelExampleFailRaw,
  },
  {
    title: "Group Parallel Example",
    description: "",
    create: groupParallelExample,
    raw: groupParallelExampleRaw,
  },
];
