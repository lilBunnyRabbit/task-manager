import { createTask } from "../task/task-builder";
import { TaskManager } from "./task-manager";
import { TaskManagerFlag } from "./task-manager.type";

describe("TaskManager", () => {
  let manager: TaskManager;

  beforeEach(() => {
    manager = new TaskManager();
  });

  // Helper tasks for testing
  const successTask = createTask<number, number>({
    name: "Success Task",
    async execute(value) {
      return value;
    },
  });

  const failTask = createTask<void, void>({
    name: "Fail Task",
    async execute() {
      throw new Error("Task failed");
    },
  });

  const progressTask = createTask<void, void>({
    name: "Progress Task",
    async execute() {
      this.setProgress(0.5);
      await new Promise((resolve) => setTimeout(resolve, 10));
      this.setProgress(1);
    },
  });

  describe("Task Queue Management", () => {
    test("should start with empty queue", () => {
      expect(manager.queue).toHaveLength(0);
    });

    test("should add tasks to queue", () => {
      manager.addTasks([successTask(1), successTask(2)]);
      expect(manager.queue).toHaveLength(2);
    });

    test("should clear queue", () => {
      manager.addTasks([successTask(1), successTask(2)]);
      manager.clearQueue();
      expect(manager.queue).toHaveLength(0);
    });
  });

  describe("Task Execution", () => {
    test("should execute tasks sequentially", async () => {
      const values = [1, 2, 3];
      manager.addTasks(values.map((v) => successTask(v)));

      await manager.start();

      expect(manager.status).toBe("success");
      expect(manager.tasks).toHaveLength(3);
      expect(manager.progress).toBe(1);
    });

    test("should execute tasks in parallel with PARALLEL_EXECUTION flag", async () => {
      const values = [1, 2, 3];
      manager.addTasks(values.map((v) => successTask(v)));
      manager.addFlag(TaskManagerFlag.PARALLEL_EXECUTION);

      await manager.start();

      expect(manager.status).toBe("success");
      expect(manager.tasks).toHaveLength(3);
    });

    test("should fail on error with FAIL_ON_ERROR flag", async () => {
      manager.addTasks([successTask(1), failTask(), successTask(2)]);

      await manager.start();

      expect(manager.status).toBe("fail");
      expect(manager.tasks).toHaveLength(2);
    });

    test("should continue on error without FAIL_ON_ERROR flag", async () => {
      manager.removeFlag(TaskManagerFlag.FAIL_ON_ERROR);
      manager.addTasks([successTask(1), failTask(), successTask(2)]);

      await manager.start();

      expect(manager.status).toBe("success");
      expect(manager.tasks).toHaveLength(3);
    });
  });

  describe("Task Results", () => {
    test("should get task result", async () => {
      manager.addTasks([successTask(42)]);
      await manager.start();

      const result = manager.getTaskResult(successTask);
      expect(result).toBe(42);
    });

    test("should get last task result", async () => {
      manager.addTasks([successTask(1), successTask(2)]);
      await manager.start();

      const result = manager.getLastTaskResult(successTask);
      expect(result).toBe(2);
    });

    test("should get all task results", async () => {
      manager.addTasks([successTask(1), successTask(2), successTask(3)]);
      await manager.start();

      const results = manager.getTasksResults(successTask);
      expect(results).toEqual([1, 2, 3]);
    });
  });

  describe("Task Progress", () => {
    test("should track progress", async () => {
      const progressSpy = jest.fn();
      manager.on("progress", progressSpy);

      manager.addTasks([progressTask()]);
      await manager.start();

      expect(progressSpy).toHaveBeenCalledWith(0.5);
      expect(progressSpy).toHaveBeenCalledWith(1);
    });
  });

  describe("Task Events", () => {
    test("should emit task event", async () => {
      const taskSpy = jest.fn();
      manager.on("task", taskSpy);

      manager.addTasks([successTask(1)]);
      await manager.start();

      expect(taskSpy).toHaveBeenCalled();
    });

    test("should emit success event", async () => {
      const successSpy = jest.fn();
      manager.on("success", successSpy);

      manager.addTasks([successTask(1)]);
      await manager.start();

      expect(successSpy).toHaveBeenCalled();
    });

    test("should emit fail event", async () => {
      const failSpy = jest.fn();
      manager.on("fail", failSpy);

      manager.addTasks([failTask()]);
      await manager.start();

      expect(failSpy).toHaveBeenCalled();
    });
  });

  describe("Task Manager Control", () => {
    test("should stop task execution", async () => {
      const longTask = createTask<void, void>({
        name: "Long Task",
        async execute() {
          await new Promise((resolve) => setTimeout(resolve, 100));
        },
      });

      manager.addTasks([longTask(), longTask()]);
      const startPromise = manager.start();

      manager.stop();
      await startPromise;

      expect(manager.status).toBe("stopped");
    });

    test("should reset task manager", async () => {
      manager.addTasks([successTask(1)]);
      await manager.start();

      manager.reset();

      expect(manager.status).toBe("idle");
      expect(manager.progress).toBe(0);
      expect(manager.queue).toHaveLength(1);
      expect(manager.tasks).toHaveLength(0);
    });
  });

  describe("Task Finding", () => {
    test("should find task by builder", async () => {
      manager.addTasks([successTask(1), failTask()]);
      await manager.start();

      const task = manager.findTask(successTask);
      expect(task?.result.get()).toBe(1);
    });

    test("should find last task by builder", async () => {
      manager.addTasks([successTask(1), successTask(2)]);
      await manager.start();

      const task = manager.findLastTask(successTask);
      expect(task?.result.get()).toBe(2);
    });

    // Fails -> 1
    test("should find all tasks by builder", async () => {
      manager.addTasks([successTask(1), successTask(2), failTask(), successTask(3)]);
      await manager.start();

      const tasks = manager.findTasks(successTask);
      expect(tasks).toHaveLength(2);
    });
  });

  describe("Error Cases", () => {
    test("should warn when starting with empty queue", async () => {
      const consoleSpy = jest.spyOn(console, "warn");
      await manager.start();
      expect(consoleSpy).toHaveBeenCalledWith("TaskManager empty queue.");
    });

    test("should throw when getting non-existent task", () => {
      expect(() => manager.getTask(successTask)).toThrow();
    });

    test("should throw when getting empty task result", async () => {
      const emptyTask = createTask<void, void>({
        name: "Empty Task",
        async execute() {},
      });

      manager.addTasks([emptyTask()]);
      await manager.start();

      expect(() => manager.getTaskResult(emptyTask)).toThrow();
    });
  });
});
