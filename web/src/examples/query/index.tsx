import { TaskManagerExampleCreate } from "..";

import queryFindExample from "./query-find.example";
import queryFindExampleRaw from "./query-find.example?raw";
import queryFindGroupedExample from "./query-find-grouped.example";
import queryFindGroupedExampleRaw from "./query-find-grouped.example?raw";
import queryFindParentExample from "./query-find-parent.example";
import queryFindParentExampleRaw from "./query-find-parent.example?raw";

export const examples: TaskManagerExampleCreate[] = [
  {
    title: "Find Tasks",
    description: (
      <>
        This example demonstrates how to use the <code>TaskQuery</code> methods to locate and retrieve tasks and their
        results from the <code>completed</code> collection in a <code>TaskManager</code>. It includes finding the first
        task (<code>find</code>, <code>get</code>, <code>getResult</code>), the last task (<code>findLast</code>,{" "}
        <code>getLast</code>, <code>getLastResult</code>), and all tasks (<code>getAll</code>, <code>getResults</code>)
        that match specific criteria.
      </>
    ),
    create: queryFindExample,
    source: queryFindExampleRaw,
  },
  {
    title: "Find Tasks (Grouped)",
    description: (
      <>
        This example showcases querying tasks within a grouped context using <code>TaskQuery</code>. It demonstrates
        finding the first (<code>find</code>, <code>get</code>, <code>getResult</code>), last (<code>findLast</code>,{" "}
        <code>getLast</code>, <code>getLastResult</code>), and all tasks (<code>getAll</code>, <code>getResults</code>)
        that match specific criteria in a group of tasks.
      </>
    ),
    create: queryFindGroupedExample,
    source: queryFindGroupedExampleRaw,
  },
  {
    title: "Find Tasks (Parent)",
    description: (
      <>
        This example showcases how to use the <code>parent</code> property in <code>TaskQuery</code> to access and query
        tasks managed by a parent <code>TaskManager</code> or <code>TaskGroup</code>. It demonstrates querying the first
        task (<code>find</code>, <code>get</code>, <code>getResult</code>), the last task (<code>findLast</code>,{" "}
        <code>getLast</code>, <code>getLastResult</code>), and all tasks (<code>getAll</code>, <code>getResults</code>)
        that match specific criteria.
      </>
    ),
    create: queryFindParentExample,
    source: queryFindParentExampleRaw,
  },
];
