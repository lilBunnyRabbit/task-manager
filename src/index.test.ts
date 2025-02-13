import { Task, TaskManager, TaskGroup } from "./";

describe("general", () => {
  test("can import classes", () => {
    expect(Task).toBeDefined();
    expect(TaskManager).toBeDefined();
    expect(TaskGroup).toBeDefined();
  });
});
