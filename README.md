# [TypeScript Task Manager](https://lilbunnyrabbit.github.io/task-manager)

[![npm version](https://img.shields.io/npm/v/@lilbunnyrabbit/task-manager.svg)](https://www.npmjs.com/package/@lilbunnyrabbit/task-manager)
[![npm downloads](https://img.shields.io/npm/dt/@lilbunnyrabbit/task-manager.svg)](https://www.npmjs.com/package/@lilbunnyrabbit/task-manager)

A flexible and powerful task management system built with [TypeScript](https://www.typescriptlang.org/). It helps in managing both **synchronous** and **asynchronous** tasks with ease, allowing you to queue tasks, execute them **sequentially** or **in parallel**, and monitor their progress.

> **✨ Check out the [Landing Page](https://lilbunnyrabbit.github.io/task-manager) for an Overview, Examples, and Use Cases!**

## 🚀 Installation

To install the package, run:

```sh
npm i @lilbunnyrabbit/task-manager
```

The package is **ESM only** (since 2.0) and needs Node.js 20+ or a bundler.

## 🎯 Features

- **Task Orchestration** – Manage workflows with **sequential** or **parallel** execution.
- **Progress Tracking** – Monitor task progress with built-in state handling.
- **Type Safety** – Built with TypeScript for safe task handling.
- **Composable Workflows** – Reuse task groups for structured execution.
- **Error Recovery** – Handle failures and continue execution.
- **Cancel and Retry** – Abort running work with an `AbortSignal`, retry failing tasks automatically, or re-run only what failed.
- **Query Interface** – Access task results, states, and logs.

For more details, visit the **[API Documentation](https://lilbunnyrabbit.github.io/task-manager/docs/api/v2.0.0/index.html)**.

## 🔥 Getting Started

This system revolves around three core components: **[`Task`](#task)**, **[`TaskGroup`](#taskgroup)**, and **[`TaskManager`](#taskmanager)**.

- **[`Task`](#task)**: Represents a single unit of work with its own logic, data, execution state, and error handling.
- **[`TaskGroup`](#taskgroup)**: Allows grouping related tasks together, managing dependencies, and structuring workflows.
- **[`TaskManager`](#taskmanager)**: Orchestrates execution, handles progress tracking, and manages error recovery.


### Creating a Task
Define a task using `createTask`:

```ts
import { createTask } from "@lilbunnyrabbit/task-manager";

const myTask = createTask<number, string>({
  name: "Example Task",
  async execute(id) {
    return `Task #${id} Completed!`;
  },
});
```

### Grouping Tasks with TaskGroup
A `TaskGroup` allows structuring workflows by managing multiple tasks:

```ts
import { createTaskGroup } from "@lilbunnyrabbit/task-manager";

const exampleGroup = createTaskGroup({
  name: "Example Group",
  tasks(ids: number[]) {
    return ids.map((id) => myTask(id));
  },
});
```

### Managing Execution with TaskManager
A `TaskManager` runs and tracks task execution:

```ts
import { TaskManager } from "@lilbunnyrabbit/task-manager";

const manager = new TaskManager();
manager.addTasks(exampleGroup([1, 2, 3]), myTask(4));
manager.start();
```

For **more examples**, visit the [Examples Section](https://lilbunnyrabbit.github.io/task-manager/#/examples).

### Cancel and Retry

Every `Task`, `TaskGroup` and `TaskManager` has a `signal` and a `cancel()`. Inside `execute`, pass `this.signal` to anything cancellable and report what's happening with `this.setMessage()`:

```ts
const download = createTask<string, Blob>({
  name: "Download",
  retry: { attempts: 3, backoff: "exponential", delay_ms: 500 },
  async execute(url) {
    this.setMessage(`Fetching ${url}`);
    const response = await fetch(url, { signal: this.signal });
    return response.blob();
  },
});

const manager = new TaskManager().addTasks(download("/a.zip"), download("/b.zip"));
manager.start();

manager.cancel(); // later: aborts the running fetch, pending downloads become "cancelled"
await manager.retry(); // re-runs only failed and cancelled tasks, keeps successful results
```

- **`cancel()`** aborts the signal with a `DOMException` named `AbortError`. Cancellation is **cooperative**: a running task stays `"in-progress"` until its `execute` settles, so pass `this.signal` on. Once it settles after the abort it ends in `"cancelled"`, whether it threw or resolved (a late result is discarded). Pending tasks become `"cancelled"` right away. A group or manager reaches `"cancelled"` only after its running tasks have settled, and emits `cancel` instead of `error`/`fail`. Cancelling a parent cancels its children. `stop()` is unchanged: it pauses between tasks and `start()` resumes.
- **A task that cancels itself** (its own `cancel()` while the parent keeps running) cancels its parent too, unless the parent has `CONTINUE_ON_ERROR`, in which case it's skipped like a failed task.
- **`retry` config** re-runs a failing `execute` up to `attempts` times in total, waiting `delay_ms` (`"fixed"`) or `delay_ms * 2 ** (attempt - 1)` (`"exponential"`) between attempts and emitting `retry` each time. It never retries an `AbortError` or anything after `cancel()`, and the wait itself is cancellable.
- **`manager.retry()`** works after an error, a cancel, a stop, or a `CONTINUE_ON_ERROR` run with failures. Successful tasks stay completed with their results (so `this.query` still finds them), failed and cancelled tasks are replaced by fresh clones, tasks that never ran stay queued, then the manager starts again. A `TaskGroup` that failed, or holds a failed task, is retried **in place** with `group.retry()`: its successful tasks are kept and only its failed ones run again.
- **Progress** counts work actually done. A cancelled task keeps the progress it had, a pending task that got cancelled counts as 0, so a cancelled manager or group stays below 1. With `CONTINUE_ON_ERROR`, a cancelled task counts as done, like a failed one.

## 📂 Use Cases

Some practical use cases of `@lilbunnyrabbit/task-manager` include:

- **[File Upload Workflow](https://lilbunnyrabbit.github.io/task-manager/#/examples?example=real-life-file-upload)** – Upload files in chunks and track progress.
- **[CI/CD Pipelines](https://lilbunnyrabbit.github.io/task-manager/#/examples?example=real-life-ci-cd-pipeline)** – Automate build, test, and deploy tasks.
- **[Image Processing](https://lilbunnyrabbit.github.io/task-manager/#/examples?example=real-life-image-processing)** – Process images with transformations.
- **[API Request Handling](https://lilbunnyrabbit.github.io/task-manager/#/examples?example=real-life-api-request)** – Fetch and process multiple API responses.

See more in the [Use Cases Section](https://lilbunnyrabbit.github.io/task-manager/#/?section=section-use-cases).


## 📚 API Overview

This section provides a rough TypeScript definition of the main components.

### Task
A `Task` represents a unit of work with execution logic, progress tracking, and result management.

```ts
interface Task<TSpec extends TaskSpec> extends TaskBase<TSpec> {
  readonly id: string;
  readonly name: string;
  readonly data: TSpec["TData"]
  readonly builder: TaskBuilder<TSpec>
  readonly logs: LogEntry[];
  readonly query?: TaskQuery;
  readonly signal: AbortSignal;
  readonly status: "idle" | "in-progress" | "error" | "success" | "cancelled";
  readonly progress: number;
  readonly message: string | null;

  setProgress(progress: number): this;
  setMessage(message: string | null): this;
  execute(): Promise<Optional<TSpec["TResult"]>>;
  cancel(reason?: unknown): this;
  parse(): ParsedTask;
  toString(pretty?: boolean): string;
  clone(): Task<TSpec>;
}

interface TaskConfig<TSpec extends TaskSpec> {
  name: string;
  execute(this: Task<TSpec>, data: TSpec["TData"]): TSpec["TResult"] | Promise<TSpec["TResult"]>;
  parse?(this: Task<TSpec>): ParsedTask | undefined;
  retry?: { attempts: number; backoff: "fixed" | "exponential"; delay_ms: number };
}
```

Task events: `param`, `log`, `progress`, `success`, `error`, `cancel`, `retry`. `TaskGroup` and `TaskManager` also emit `cancel`.

### TaskGroup
A `TaskGroup` manages multiple tasks and defines execution order.

```ts
interface TaskGroup<TArgs extends unknown[]> extends TaskGroupBase {
  readonly id: string;
  readonly name: string;
  readonly args: TArgs;
  readonly builder: TaskGroupBuilder<TArgs>;
  readonly mode: ExecutionMode;
  readonly tasks: ExecutableTask[];
  readonly query: TaskQuery;
  readonly signal: AbortSignal;
  readonly status: "idle" | "in-progress" | "error" | "success" | "cancelled";

  execute(): Promise<this>;
  cancel(reason?: unknown): this;
  retry(): this; // back to "idle", ready to execute again
  toString(pretty?: boolean): string;
  clone(): TaskGroup<TArgs>;
}
```

### TaskManager
A `TaskManager` executes tasks, tracks progress, and manages execution settings.

```ts
interface TaskManager extends TaskManagerBase {
  readonly tasks: ExecutableTask[];
  readonly query: TaskQuery;
  readonly signal: AbortSignal;
  readonly status: "idle" | "in-progress" | "error" | "success" | "stopped" | "cancelled";

  addTask(task: ExecutableTask): this;
  addTasks(...tasks: ExecutableTask[]): this;
  start(force?: boolean): Promise<void>;
  stop(): void;
  cancel(reason?: unknown): void;
  retry(): Promise<void>;
  reset(): void;
  clearQueue(): this;
}
```

For **full API documentation**, visit the [Docs](https://lilbunnyrabbit.github.io/task-manager/docs/api/v2.0.0/index.html).


## 🔧 Development

### Setup
Clone the repository and install dependencies:

```sh
git clone https://github.com/lilBunnyRabbit/task-manager.git
cd task-manager
npm install
```

### Available Scripts
| Command                 | Description                                                                                           |
| ----------------------- | ----------------------------------------------------------------------------------------------------- |
| `npm run build`         | Compiles [TypeScript](https://www.typescriptlang.org/) code.                                          |
| `npm test`              | Runs tests with [Jest](https://jestjs.io/).                                                           |
| `npm run clean`         | Clears `dist/` and `node_modules/`.                                                                   |
| `npm run changeset`     | Manages versioning and changelog updates with [Changesets](https://github.com/changesets/changesets). |
| `npm run release`       | Publishes the package to npm.                                                                         |
| `npm run generate:docs` | Generates API documentation.                                                                          |


## 📦 Related Packages

These utilities complement `@lilbunnyrabbit/task-manager`:

| Package                                                                                          | Description                                        |
| ------------------------------------------------------------------------------------------------ | -------------------------------------------------- |
| **[@lilbunnyrabbit/event-emitter](https://www.npmjs.com/package/@lilbunnyrabbit/event-emitter)** | A lightweight event system for tasks.              |
| **[@lilbunnyrabbit/optional](https://www.npmjs.com/package/@lilbunnyrabbit/optional)**           | A TypeScript utility for handling optional values. |
| **[@lilbunnyrabbit/utils](https://www.npmjs.com/package/@lilbunnyrabbit/utils)**                 | Collection of helper functions and utilities.      |


## 🎉 Contribution

Contributions are always welcome! For any enhancements or bug fixes, please open a pull request linked to the relevant issue. If there's no existing issue related to your contribution, feel free to create one.

## 💖 Support

Your support is greatly appreciated! If this package has been helpful, consider supporting its development. Your contributions help maintain and improve this project.  

[![GitHub Sponsor](https://img.shields.io/static/v1?label=Sponsor&message=%E2%9D%A4&logo=GitHub&color=%23fe8e86)](https://github.com/sponsors/lilBunnyRabbit)

## 📜 License

MIT © Andraž Mesarič-Sirec