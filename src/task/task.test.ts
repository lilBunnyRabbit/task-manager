// task.test.ts
import { Task } from "./task";
import { createTask } from "./task-builder";
import { createTaskId, isTask } from "./task.helper";

describe("Task Management System", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Task", () => {
    const mockTaskBuilder = createTask<string, number>({
      name: "Test Task",
      execute: async (data) => data.length,
    });

    let task: Task<{ TData: string; TResult: number; TError: Error }>;

    beforeEach(() => {
      task = mockTaskBuilder("test");
    });

    test("should initialize with correct properties", () => {
      expect(task.name).toBe("Test Task");
      expect(task.data).toBe("test");
      expect(task.status).toBe("idle");
      expect(task.progress).toBe(0);
      expect(task.result.isEmpty()).toBe(true);
    });

    test("should execute successfully", async () => {
      const result = await task.execute();

      expect(result.get()).toBe(4); // length of "test"
      expect(task.status).toBe("success");
      expect(task.progress).toBe(1);
    });

    test("should handle execution errors", async () => {
      const errorTask = createTask<void, never>({
        name: "Error Task",
        execute: () => {
          throw new Error("Test error");
        },
      })();

      await expect(errorTask.execute()).rejects.toThrow("Test error");
      expect(errorTask.status).toBe("error");
      expect(errorTask.errors).toHaveLength(1);
      expect(errorTask.errors![0].message).toBe("Test error");
    });

    test("should emit events on status change", () => {
      const mockEmit = jest.spyOn(task, "emit");

      task.setStatus("in-progress");

      expect(mockEmit).toHaveBeenCalledWith("change");
      expect(task.status).toBe("in-progress");
    });

    test("should emit events on progress update", () => {
      const mockEmit = jest.spyOn(task, "emit");

      task.setProgress(0.5);

      expect(mockEmit).toHaveBeenCalledWith("progress", 0.5);
      expect(mockEmit).toHaveBeenCalledWith("change");
      expect(task.progress).toBe(0.5);
    });

    test("should handle warnings", () => {
      const mockEmit = jest.spyOn(task, "emit");

      task.addWarning("Test warning");

      expect(mockEmit).toHaveBeenCalledWith("change");
      expect(task.warnings).toContain("Test warning");
    });

    test("should parse task state correctly", () => {
      task.addWarning("Test warning");
      task.addError(new Error("Test error"));

      const parsed = task.parse();

      expect(parsed.status).toBe("Test Task - idle");
      expect(parsed.warnings).toContain("Test warning");
      expect(parsed.errors).toContain("Test error");
    });

    test("should clone task correctly", () => {
      const clonedTask = task.clone();

      expect(clonedTask).toBeInstanceOf(Task);
      expect(clonedTask.name).toBe(task.name);
      expect(clonedTask.data).toBe(task.data);
      expect(clonedTask.id).not.toBe(task.id);
    });
  });

  describe("Helper Functions", () => {
    test("createTaskId should generate unique IDs", () => {
      const id1 = createTaskId("Task1");
      const id2 = createTaskId("Task1");

      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^[a-f0-9]+-[a-f0-9]+-[a-f0-9]+$/);
    });

    test("isTask should correctly identify Task instances", () => {
      const taskBuilder = createTask<void, string>({
        name: "Test Task",
        execute: async () => "result",
      });

      const task = taskBuilder();
      const notTask = {};

      expect(isTask(task, taskBuilder)).toBe(true);
      expect(isTask(notTask, taskBuilder)).toBe(false);
    });
  });

  describe("Task Builder", () => {
    test("should create task builder with correct properties", () => {
      const builder = createTask<string, number>({
        name: "Test Task",
        execute: async (data) => data.length,
      });

      expect(builder.taskName).toBe("Test Task");
      expect(builder.id).toBeDefined();
      expect(typeof builder).toBe("function");
    });

    test("should create tasks with custom parse function", () => {
      const builder = createTask<string, number, string>({
        name: "Custom Task",
        execute: async (data) => data.length,
        parse() {
          return {
            status: "Custom Status",
            result: "Custom Result",
          };
        },
      });

      const task = builder("test");
      const parsed = task.parse();

      expect(parsed.status).toBe("Custom Status");
      expect(parsed.result).toBe("Custom Result");
    });
  });
});

// import { isString } from "@lilbunnyrabbit/utils";
// import { Task, createTask } from "./";

// describe("Task", () => {
//   const taskBuilder = createTask<number, number, Record<string, string>>({
//     name: "Duplicate Value",

//     parse() {
//       return {
//         status: { tralala: "Duplicate Status" },
//         warnings: ["Warning 1", "Warning 2"],
//         errors: ["Error 1", "Error 2"],
//         result: "Duplicate Result",
//       };
//     },

//     execute(value) {
//       return value * 2;
//     },
//   });

//   it("can create task builder", () => {
//     expect(taskBuilder).toBeDefined();
//     expect(isString(taskBuilder.id)).toBe(true);
//     expect(taskBuilder.taskName).toBe("Duplicate Value");
//   });

//   it("can create Task", () => {
//     const task = taskBuilder(3);

//     expect(task).toBeInstanceOf(Task);
//     expect(task.name).toBe("Duplicate Value");
//     expect(task.data).toBe(3);
//   });

//   it("can execute Task", async () => {
//     const task = taskBuilder(3);

//     expect(task.status).toBe("idle");
//     const result = await task.execute();
//     expect(result.get()).toBe(6);
//     expect(task.status).toBe("success");
//   });
// });
