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

## 🎯 Features

- **Task Orchestration** – Manage workflows with **sequential** or **parallel** execution.
- **Progress Tracking** – Monitor task progress with built-in state handling.
- **Type Safety** – Built with TypeScript for safe task handling.
- **Composable Workflows** – Reuse task groups for structured execution.
- **Error Recovery** – Handle failures and continue execution.
- **Query Interface** – Access task results, states, and logs.

For more details, visit the **[API Documentation](https://lilbunnyrabbit.github.io/task-manager/docs/api/v1.0.0/index.html)**.

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

  execute(): Promise<Optional<TSpec["TResult"]>>;
  parse(): ParsedTask;
  toString(pretty?: boolean): string;
  clone(): Task<TSpec>;
}
```

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

  execute(): Promise<this>;
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

  addTask(task: ExecutableTask): this;
  addTasks(...tasks: ExecutableTask[]): this;
  start(force?: boolean): Promise<void>;
  stop(): void;
  reset(): void;
  clearQueue(): this;
}
```

For **full API documentation**, visit the [Docs](https://lilbunnyrabbit.github.io/task-manager/docs/api/v1.0.0/index.html).


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

Your support is greatly appreciated! If this package has been helpful, consider supporting by buying me a coffee.

[!["Buy Me A Coffee"](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://www.buymeacoffee.com/lilBunnyRabbit)


## 📜 License

MIT © Andraž Mesarič-Sirec