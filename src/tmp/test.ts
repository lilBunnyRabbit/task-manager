import { createTaskGroup } from "../core/task-group/task-group-builder";

const a = createTaskGroup({
  name: "Upload File",

  create(arg1: string, args2: number) {
    return [
      task1(arg1),
      task2(args2)
    ]
  }
})

const b = createTaskGroup({
  name: "Upload File",

  tasks: [
    task1(arg1),
    task2(args2)
  ],

  create() {
    return tasks
  }
})

const uploadFileGroup = createTasksGroup({
  name: "Upload File",
  executionMode: "sequential", // Default to sequential
  tasks: [task1("file"), task2(100)],
});