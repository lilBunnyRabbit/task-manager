import {
  createTask,
  createTaskGroup,
  ExecutionMode,
  isTaskError,
  Task,
  TaskGroup,
  TaskGroupFlag,
  TaskManager,
  TaskManagerFlag,
} from "./index.js";

function untilAborted(signal: AbortSignal) {
  return new Promise<never>((_, reject) => {
    if (signal.aborted) return reject(signal.reason);
    signal.addEventListener("abort", () => reject(signal.reason), { once: true });
  });
}

const tick = () => new Promise((resolve) => setTimeout(resolve, 0));

function hanging(name: string) {
  return createTask({
    name,
    execute() {
      return untilAborted(this.signal);
    },
  });
}

beforeEach(() => {
  jest.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("general", () => {
  test("can import classes", () => {
    expect(Task).toBeDefined();
    expect(TaskManager).toBeDefined();
    expect(TaskGroup).toBeDefined();
  });

  test("ids are uuids", () => {
    const task = createTask({ name: "a", execute() {} })();

    expect(task.id).toMatch(/^[0-9a-f-]{36}$/);
  });
});

describe("message", () => {
  test("setMessage emits param and shows in parse()", async () => {
    const task = createTask({
      name: "message",
      execute() {
        this.setMessage("working");
      },
    })();

    const params: string[] = [];
    task.on("param", (param) => void params.push(param));

    expect(task.message).toBeNull();

    await task.execute();

    expect(task.message).toBe("working");
    expect(params).toContain("message");
    expect(task.parse().message).toBe("working");

    task.setMessage(null);
    expect(task.parse().message).toBeUndefined();
  });
});

describe("Task cancel", () => {
  test("each task and clone has its own signal", () => {
    const task = createTask({ name: "a", execute() {} })();
    const clone = task.clone();

    expect(task.signal).toBeInstanceOf(AbortSignal);
    expect(clone.signal).not.toBe(task.signal);
  });

  test("cancelling a running task rejects with AbortError and emits cancel, not error", async () => {
    const task = hanging("hanging")();
    const onError = jest.fn();
    const onCancel = jest.fn();
    task.on("error", onError).on("cancel", onCancel);

    const running = task.execute();
    task.cancel();

    const error = await running.catch((e) => e);
    expect(isTaskError(error)).toBe(true);
    expect(error.error).toBeInstanceOf(DOMException);
    expect(error.error.name).toBe("AbortError");
    expect(task.status).toBe("cancelled");
    expect(task.signal.aborted).toBe(true);
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onError).not.toHaveBeenCalled();
  });

  test("a task ignoring the signal still rejects right away", async () => {
    const task = createTask({
      name: "stubborn",
      execute: () => new Promise<number>((resolve) => setTimeout(() => resolve(1), 50)),
    })();

    const running = task.execute();
    task.cancel();

    await expect(running).rejects.toBeDefined();
    expect(task.status).toBe("cancelled");
  });

  test("cancelling an idle task makes it cancelled", async () => {
    const task = createTask({ name: "a", execute() {} })();
    task.cancel();

    expect(task.status).toBe("cancelled");
    await expect(task.execute()).rejects.toThrow('Task is not in "idle" state.');
  });

  test("cancel on a finished task is a no-op", async () => {
    const task = createTask({ name: "a", execute: () => 1 })();
    await task.execute();
    task.cancel();

    expect(task.status).toBe("success");
    expect(task.signal.aborted).toBe(false);
  });
});

describe("Task retry", () => {
  test("retries until it succeeds", async () => {
    let calls = 0;
    const task = createTask<void, string>({
      name: "flaky",
      retry: { attempts: 3, backoff: "exponential", delay_ms: 1 },
      execute() {
        calls++;
        if (calls < 3) throw new Error(`fail ${calls}`);
        return "ok";
      },
    })();

    const retries: Array<{ attempt: number; delay_ms: number }> = [];
    task.on("retry", ({ attempt, delay_ms }) => void retries.push({ attempt, delay_ms }));

    const result = await task.execute();

    expect(result.get()).toBe("ok");
    expect(task.status).toBe("success");
    expect(calls).toBe(3);
    expect(retries).toEqual([
      { attempt: 1, delay_ms: 1 },
      { attempt: 2, delay_ms: 2 },
    ]);
  });

  test("fails after the last attempt", async () => {
    let calls = 0;
    const task = createTask({
      name: "broken",
      retry: { attempts: 2, backoff: "fixed", delay_ms: 1 },
      execute() {
        calls++;
        throw new Error("nope");
      },
    })();

    await expect(task.execute()).rejects.toBeDefined();
    expect(calls).toBe(2);
    expect(task.status).toBe("error");
  });

  test("never retries an AbortError", async () => {
    let calls = 0;
    const task = createTask({
      name: "aborting",
      retry: { attempts: 5, backoff: "fixed", delay_ms: 1 },
      execute() {
        calls++;
        throw new DOMException("aborted elsewhere", "AbortError");
      },
    })();

    await expect(task.execute()).rejects.toBeDefined();
    expect(calls).toBe(1);
    expect(task.status).toBe("error");
  });

  test("cancel during the retry delay stops retrying", async () => {
    let calls = 0;
    const task = createTask({
      name: "slow-retry",
      retry: { attempts: 5, backoff: "fixed", delay_ms: 10_000 },
      execute() {
        calls++;
        throw new Error("nope");
      },
    })();

    const running = task.execute();
    await tick();
    task.cancel();

    await expect(running).rejects.toBeDefined();
    expect(calls).toBe(1);
    expect(task.status).toBe("cancelled");
  });
});

describe("TaskManager cancel", () => {
  test.each([ExecutionMode.SEQUENTIAL, ExecutionMode.PARALLEL])("cancels running and pending tasks (%s)", async (mode) => {
    const first = hanging("first")();
    const second = hanging("second")();
    const manager = new TaskManager().setMode(mode).addTasks(first, second);

    const onError = jest.fn();
    const onFail = jest.fn();
    const onCancel = jest.fn();
    manager.on("error", onError).on("fail", onFail).on("cancel", onCancel);

    const running = manager.start();
    await tick();
    manager.cancel();
    await running;

    expect(manager.status).toBe("cancelled");
    expect(manager.signal.aborted).toBe(true);
    expect(first.status).toBe("cancelled");
    expect(second.status).toBe("cancelled");
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onError).not.toHaveBeenCalled();
    expect(onFail).not.toHaveBeenCalled();
    expect(manager.progress).toBeLessThan(1);
  });

  test("cancels nested groups and their tasks", async () => {
    const inner = hanging("inner");
    const group = createTaskGroup({ name: "group", tasks: () => [inner(), inner()] })();
    const manager = new TaskManager().addTasks(group);

    const running = manager.start();
    await tick();
    manager.cancel();
    await running;

    expect(manager.status).toBe("cancelled");
    expect(group.status).toBe("cancelled");
    expect(group.signal.aborted).toBe(true);
    expect(group.tasks.map((task) => task.status)).toEqual(["cancelled", "cancelled"]);
  });

  test("a task cancelling itself cancels the manager", async () => {
    const self = hanging("self")();
    const after = createTask({ name: "after", execute() {} })();
    const manager = new TaskManager().addTasks(self, after);

    const running = manager.start();
    await tick();
    self.cancel();
    await running;

    expect(manager.status).toBe("cancelled");
    expect(after.status).toBe("cancelled");
  });

  test("with CONTINUE_ON_ERROR a self-cancelled task is skipped", async () => {
    const self = hanging("self")();
    const after = createTask({ name: "after", execute() {} })();
    const manager = new TaskManager().addTasks(self, after);
    manager.addFlag(TaskManagerFlag.CONTINUE_ON_ERROR);

    const onError = jest.fn();
    manager.on("error", onError);

    const running = manager.start();
    await tick();
    self.cancel();
    await running;

    expect(self.status).toBe("cancelled");
    expect(after.status).toBe("success");
    expect(manager.status).toBe("success");
    expect(onError).not.toHaveBeenCalled();
  });

  test("stop() still pauses, cancel() on a stopped manager cancels pending tasks", async () => {
    const first = createTask({ name: "first", execute: () => new Promise((r) => setTimeout(r, 5)) })();
    const second = createTask({ name: "second", execute() {} })();
    const manager = new TaskManager().addTasks(first, second);

    const running = manager.start();
    manager.stop();
    await running;

    expect(manager.status).toBe("stopped");
    expect(second.status).toBe("idle");

    manager.cancel();

    expect(manager.status).toBe("cancelled");
    expect(second.status).toBe("cancelled");
  });

  test("cancel() on an idle manager only warns", () => {
    const manager = new TaskManager().addTasks(createTask({ name: "a", execute() {} })());
    manager.cancel();

    expect(manager.status).toBe("idle");
    expect(console.warn).toHaveBeenCalled();
  });
});

describe("TaskManager retry", () => {
  test("re-runs only failed tasks and keeps results", async () => {
    let flakyCalls = 0;
    let stableCalls = 0;

    const stable = createTask<void, number>({
      name: "stable",
      execute() {
        stableCalls++;
        return 21;
      },
    });
    const flaky = createTask<void, number>({
      name: "flaky",
      execute() {
        flakyCalls++;
        if (flakyCalls === 1) throw new Error("first run fails");
        return this.query.getResult(stable) * 2;
      },
    });
    const last = createTask<void, number>({
      name: "last",
      execute() {
        return this.query.getResult(flaky) + 1;
      },
    });

    const stableTask = stable();
    const manager = new TaskManager().addTasks(stableTask, flaky(), last());

    await manager.start();
    expect(manager.status).toBe("error");

    await manager.retry();

    expect(manager.status).toBe("success");
    expect(stableCalls).toBe(1);
    expect(flakyCalls).toBe(2);
    expect(manager.tasks[0]).toBe(stableTask);
    expect(manager.tasks.map((task) => task.name)).toEqual(["stable", "flaky", "last"]);
    expect(manager.query.getResult(last)).toBe(43);
    expect(manager.progress).toBe(1);
  });

  test("retries a failed task inside a group in place", async () => {
    let flakyCalls = 0;
    let okCalls = 0;

    const ok = createTask({ name: "ok", execute: () => void okCalls++ });
    const flaky = createTask({
      name: "flaky",
      execute() {
        if (++flakyCalls === 1) throw new Error("first run fails");
      },
    });
    const group = createTaskGroup({ name: "group", tasks: () => [ok(), flaky()] })();
    const manager = new TaskManager().addTasks(group);

    await manager.start();
    expect(group.status).toBe("error");

    await manager.retry();

    expect(manager.status).toBe("success");
    expect(manager.tasks[0]).toBe(group);
    expect(group.status).toBe("success");
    expect(okCalls).toBe(1);
    expect(flakyCalls).toBe(2);
  });

  test("retries a CONTINUE_ON_ERROR group that succeeded with a failed task", async () => {
    let flakyCalls = 0;

    const flaky = createTask({
      name: "flaky",
      execute() {
        if (++flakyCalls === 1) throw new Error("first run fails");
      },
    });
    const group = createTaskGroup({
      name: "group",
      mode: ExecutionMode.PARALLEL,
      flags: [TaskGroupFlag.CONTINUE_ON_ERROR],
      tasks: () => [flaky(), flaky()],
    })();
    const manager = new TaskManager().addTasks(group);

    await manager.start();
    expect(group.status).toBe("success");
    expect(group.tasks.filter((task) => task.status === "error")).toHaveLength(1);

    await manager.retry();

    expect(group.tasks.map((task) => task.status)).toEqual(["success", "success"]);
    expect(flakyCalls).toBe(3);
  });

  test("retries cancelled tasks after cancel()", async () => {
    let calls = 0;
    const task = createTask({
      name: "slow",
      execute() {
        if (++calls === 1) return untilAborted(this.signal);
      },
    });
    const manager = new TaskManager().addTasks(task(), task());

    const running = manager.start();
    await tick();
    manager.cancel();
    await running;
    expect(manager.status).toBe("cancelled");

    await manager.retry();

    expect(manager.status).toBe("success");
    expect(manager.signal.aborted).toBe(false);
    expect(manager.tasks.map((t) => t.status)).toEqual(["success", "success"]);
  });

  test("retry() with nothing to retry only warns", async () => {
    const manager = new TaskManager().addTasks(createTask({ name: "a", execute() {} })());
    await manager.start();
    await manager.retry();

    expect(manager.status).toBe("success");
    expect(console.warn).toHaveBeenCalledWith("No failed or cancelled tasks.");
  });
});

describe("TaskGroup", () => {
  test("cancel() on an idle group cancels its tasks", () => {
    const group = createTaskGroup({ name: "group", tasks: () => [hanging("a")(), hanging("b")()] })();
    const onCancel = jest.fn();
    group.on("cancel", onCancel);

    group.cancel();

    expect(group.status).toBe("cancelled");
    expect(group.tasks.map((task) => task.status)).toEqual(["cancelled", "cancelled"]);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  test("retry() returns the group to idle so it can run again", async () => {
    let calls = 0;
    const flaky = createTask({
      name: "flaky",
      execute() {
        if (++calls === 1) throw new Error("first run fails");
      },
    });
    const group = createTaskGroup({ name: "group", tasks: () => [flaky()] })();

    await expect(group.execute()).rejects.toBeDefined();
    expect(group.status).toBe("error");

    group.retry();
    expect(group.status).toBe("idle");

    await group.execute();
    expect(group.status).toBe("success");
  });
});
