import { isString } from "@lilbunnyrabbit/utils";
import { Task, createTask } from "./";

describe("Task", () => {
  const taskBuilder = createTask<number, number>({
    name: "Duplicate Value",

    parse() {
      return {
        status: "Duplicate Status",
        warnings: ["Warning 1", "Warning 2"],
        errors: ["Error 1", "Error 2"],
        result: "Duplicate Result",
      };
    },

    execute(value) {
      return value * 2;
    },
  });

  it("can create task builder", () => {
    expect(taskBuilder).toBeDefined();
    expect(isString(taskBuilder.id)).toBe(true);
    expect(taskBuilder.taskName).toBe("Duplicate Value");
  });

  it("can create Task", () => {
    const task = taskBuilder(3);

    expect(task).toBeInstanceOf(Task);
    expect(task.name).toBe("Duplicate Value");
    expect(task.data).toBe(3);
  });

  it("can execute Task", async () => {
    const task = taskBuilder(3);

    expect(task.status).toBe("idle");
    const result = await task.execute();
    expect(result.get()).toBe(6);
    expect(task.status).toBe("success");
  });
});
