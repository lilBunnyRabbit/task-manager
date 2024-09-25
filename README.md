# [TypeScript](https://www.typescriptlang.org/) Task Management System

[![npm version](https://img.shields.io/npm/v/@lilbunnyrabbit/task-manager.svg)](https://www.npmjs.com/package/@lilbunnyrabbit/task-manager)
[![npm downloads](https://img.shields.io/npm/dt/@lilbunnyrabbit/task-manager.svg)](https://www.npmjs.com/package/@lilbunnyrabbit/task-manager)

A flexible and powerful task management system built with [TypeScript](https://www.typescriptlang.org/). It helps in managing both synchronous and asynchronous tasks with ease, allowing you to queue tasks, execute them sequentially or in parallel, and monitor their progress.

> [!NOTE]  
> This project uses `EventEmitter` and `Optional` from [![npm version](https://img.shields.io/npm/v/%40lilbunnyrabbit%2Futils?label=%40lilbunnyrabbit%2Futils)](https://www.npmjs.com/package/@lilbunnyrabbit/utils) for handling events and optional values.

## Installation

To use this package in your project, run:

```sh
npm i @lilbunnyrabbit/task-manager
```

## Getting Started

This system revolves around two main components: [`TaskManager`](#taskmanager) and [`Task`](#task).

- **[`TaskManager`](#taskmanager)**: Manages task execution, queuing, and progress tracking. It can run tasks sequentially or in parallel, giving full control over execution.
- **[`Task`](#task)**: Represents a single unit of work. Each task encapsulates its own logic, data, and execution state, with custom error handling and progress reporting.

### Creating a Task

You can create a task using the `createTask` function:

```ts
import { createTask } from "@lilbunnyrabbit/task-manager";

const myTask = createTask<void, string>({
  name: "Example Task",

  async execute() {
    return "Task Completed!";
  },
});
```

### Managing Tasks with TaskManager

[`Tasks`](#task) are managed using the [`TaskManager`](#taskmanager), which allows you to add tasks, track progress, and handle task completion:

```ts
import { TaskManager } from "@lilbunnyrabbit/task-manager";

const manager = new TaskManager();

manager.addTasks([myTask()]);
manager.start();
```

## Examples

You can find more examples of how to use this task management system in the [`examples`](./examples) folder. Some key examples include:

- **[Basic Task Execution](./examples/basic-example)**: Learn how to create and execute a simple task.
- **[Sequential Task Execution](./examples/sequential-example)**: Execute tasks one after the other.
- **[Parallel Task Execution](./examples/parallel-example)**: Run tasks concurrently with parallel execution.

## API Overview

This is a quick rundown of the key classes and methods in the task management system.

If you're looking for detailed API docs, check out the [full documentation](https://lilbunnyrabbit.github.io/task-manager/api) generated via [Typedoc](https://typedoc.org/).

### TaskManager

The `TaskManager` is responsible for managing tasks and controlling their execution.

- `addTasks(tasks: Task[])`: Adds tasks to the queue.
- `start([force: boolean])`: Starts executing the tasks in the queue.
- `stop()`: Stops execution of tasks.
- `reset()`: Resets the task manager and its state.
- `clearQueue()`: Clears the task queue.

### Task

A `Task` represents a single unit of work within the system.

- `execute()`: Executes the task.
- `parse()`: Returns a UI-friendly representation of the task's state.
- `clone()`: Clones the task for re-execution.

## Development

This section provides a guide for developers to set up the project environment and utilize various npm scripts defined in the project for efficient development and release processes.

### Setting Up

Clone the repository and install dependencies:

```sh
git clone https://github.com/lilBunnyRabbit/task-manager.git
cd task-manager
npm install
```

### NPM Scripts

The project includes several npm scripts to streamline common tasks such as building, testing, and cleaning up the project.

| Script              | Description                                                                                                                                                                                       | Command                 |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| **`build`**         | Compiles the [TypeScript](https://www.typescriptlang.org/) source code to JavaScript, placing the output in the `dist` directory. Essential for preparing the package for publication or testing. | `npm run build`         |
| **`test`**          | Executes the test suite using [Jest](https://jestjs.io/). Crucial for ensuring that your code meets all defined tests and behaves as expected.                                                    | `npm test`              |
| **`clean`**         | Removes both the `dist` directory and the `node_modules` directory. Useful for resetting the project's state during development or before a fresh install.                                        | `npm run clean`         |
| **`changeset`**     | Manages versioning and changelog generation based on conventional commit messages. Helps prepare for a new release by determining which parts of the package need version updates.                | `npm run changeset`     |
| **`release`**       | Publishes the package to npm. Uses `changeset publish` to automatically update package versions and changelogs before publishing. Streamlines the release process.                                | `npm run release`       |
| **`generate:docs`** | Generates project documentation using [Typedoc](https://typedoc.org/). Facilitates the creation of comprehensive and accessible API documentation.                                                | `npm run generate:docs` |

These scripts are designed to facilitate the development process, from cleaning and building the project to running tests and releasing new versions. Feel free to use and customize them as needed for your development workflow.

## Contribution

Contributions are always welcome! For any enhancements or bug fixes, please open a pull request linked to the relevant issue. If there's no existing issue related to your contribution, feel free to create one.

## Support

Your support is greatly appreciated! If this package has been helpful, consider supporting by buying me a coffee.

[!["Buy Me A Coffee"](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://www.buymeacoffee.com/lilBunnyRabbit)

## License

MIT © Andraž Mesarič-Sirec