import { TaskManagerExampleCreate } from "..";

import calculationExample from "./calculation.example";
import calculationExampleRaw from "./calculation.example?raw";
export const examples: TaskManagerExampleCreate[] = [
  {
    id: "other-calculation",
    title: "Calculation",
    description: (
      <>
        This example demonstrates a number calculation workflow using <code>TaskManager</code> and{" "}
        <code>TaskGroup</code>. It includes a <code>Create Random Number</code> task that generates values, a{" "}
        <code>Sum Objects</code> task that aggregates them, and an <code>Average Objects</code> task that computes the
        average. The <code>Summary</code> task provides an overview of the calculated results across multiple execution
        groups. Task querying is used to retrieve intermediate values, and execution is structured to handle tasks in
        parallel.
      </>
    ),
    create: calculationExample,
    source: calculationExampleRaw,
  },
];
