# [TypeScript](https://www.typescriptlang.org/) Task Management System

This [TypeScript](https://www.typescriptlang.org/) project implements a sophisticated task management system, designed to facilitate the creation, execution, and monitoring of asynchronous and synchronous tasks in a structured and efficient manner. The system is built around two primary components: [`TaskManager`](#taskmanager) and [`Task`](#task).

[`TaskManager`](#taskmanager) serves as the central orchestrator for managing multiple tasks. It provides capabilities to queue tasks, control their execution (either sequentially or in parallel), and monitor their overall progress and status. This makes it ideal for scenarios where tasks need to be executed in a specific order or concurrently, with the ability to handle dependencies and execution flows dynamically.

The [`Task`](#task) class represents individual units of work. Each task encapsulates its own logic, data, and execution state. [`Task`](#task)s are highly configurable, allowing for custom execution logic and error handling.

The system is designed to be flexible and adaptable, suitable for various use cases ranging from simple background data processing to complex workflow management in web applications. The event-driven architecture of both [`TaskManager`](#taskmanager) and [`Task`](#task) ensures that users can easily hook into different stages of task execution for logging, monitoring, or altering the flow based on dynamic conditions.

> **Note**   
> This project requires [`EventEmitter`](https://gist.github.com/lilBunnyRabbit/5c4370375c4974220f20c8b7a392de91) and [`Optional`](https://gist.github.com/lilBunnyRabbit/ab44b9bafca79cf1fa8024d833a60e24) to work.

## Usage

### Creating a [`Task`](#task)

To create a new task, define it using the [`createTask`](#createtaskconfig) function with the required configuration.

```ts
interface Data {
  name: string;
}

interface Result {
  id: string;
  name: string;
}

const createUserTask = createTask<Data, Result>({
  name: "Create User",

  parse() {
    const title = () => {
      switch (this.status) {
        case "idle":
          return `${this.name} with value ${this.data}`;
        case "in-progress":
          return "Creating user...";
        case "error":
          return "Failed to create user...";
        case "success":
          return `User created #(${this.result.get()!.id})`;
      }
    };

    return {
      status: title(),
      result: this.result.isPresent() ? JSON.stringify(this.result.get()) : undefined,
    };
  },

  async execute(data) {
    const user = await someApiCall(data);

    return user;
  },
});
```

### Managing [`Task`](#task)s with [`TaskManager`](#taskmanager)

Use the [`TaskManager`](#taskmanager) class to add, execute, and monitor tasks.

```ts
const taskManager = new TaskManager();
taskManager.addTasks([createUserTask({ name: "Foo" })]);
taskManager.start();
```

## Full Example

### Define [`Task`](#task)s

```ts
// tasks/createObject.ts
export default createTask<number, { value: number }>({
    name: "Create Object",

    async execute(value) {
        if (value > 100) {
            this.addWarning(`Value "${value}" is > 100.`);
        }

        return { value };
    },
});

// tasks/sumObjects.ts
import createObjectTask from "./createObject";

export default createTask<void, number>({
    name: "Sum Objects",

    async execute() {
        const objects = this.manager.getTasksResults(createObjectTask);

        if (!objects.length) {
            throw new Error(`Requires at least one task by ${createObjectTask}`);
        }

        let sum = 0;

        for (let i = 0; i < objects.length; i++) {
            sum += objects[i].value;

            this.setProgress(i / objects.length);
        }

        return sum;
    },
});

// tasks/averageObjects.ts
import createObjectTask from "./createObject";
import sumObjectsTask from "./sumObjects";

export default createTask<void, number>({
    name: "Average Objects",

    async execute() {
        const tasks = this.manager.findTasks(createObjectTask);

        const sum = this.manager.getLastTaskResult(sumObjectsTask);

        return sum / tasks.length;
    },
});

// tasks.ts
import createObjectTask from "./createObject";
import sumObjectsTask from "./sumObjects";
import averageObjectsTask from "./averageObjects";

export const ExampleTasks = (values: number[]) => [
    ...values.map((value) => {
        return createObjectTask(value);
    }),
    sumObjectsTask(),
    averageObjectsTask(),
];

```

### Use [`Task`](#task)s

```ts
const taskManager = new TaskManager((manager) => {
    manager.addTasks(ExampleTasks([1, 2, 3]));

    // Execution will continue even if the task fails
    manager.removeFlag(TaskManager.Flag.FAIL_ON_ERROR);
});

taskManager.on("change", function () {
    console.log("TaskManager change", this);
});

taskManager.start();
```

### React Example

```tsx
import React from "react";

export function useTaskManager(initialSetup?: (manager: TaskManager) => void) {
  const [setup] = React.useState<typeof initialSetup>(() => initialSetup);

  const [instance, setInstance] = React.useState<TaskManager | null>(null);
  const [updatedAt, setUpdatedAt] = React.useState(Date.now());

  React.useEffect(() => {
    const onChange = () => {
      setUpdatedAt(Date.now());
    };

    const manager = new TaskManager().on("change", onChange);
    setInstance(manager);

    setup?.(manager);

    return () => {
      manager.off("change", onChange);
      setInstance(null);
    };
  }, [setup]);

  return {
    manager: instance,
    deps: [instance, updatedAt] as React.DependencyList,
  };
}

export const TaskManagerPreview: React.FC = () => {
  const { manager } = useTaskManager((manager) => {
    manager.addTasks(ExampleTasks([1, 2, 3]));

    // Enables parallel execution
    manager.addFlag(TaskManager.Flag.PARALLEL_EXECUTION);
  });

  return (
    <div>
      <button onClick={() => manager.start()}>Start</button>

      {manager.tasks.map((task) => JSON.stringify(task.parse()))}

      {manager.queue.map((task) => JSON.stringify(task.parse()))}
    </div>
  )
}
```

## API

### `TaskManager`

The `TaskManager` class is responsible for managing the execution and lifecycle of tasks.

#### Properties

| Name       | Description                |
| ---------- | -------------------------- |
| `status`   | Current status.            |
| `progress` | Current progress of tasks. |
| `flags`    | Current set of flags.      |

#### Methods

| Name                             | Description                                                         |
| -------------------------------- | ------------------------------------------------------------------- |
| `addTasks(tasks)`                | Adds an array of tasks to the task queue.                           |
| `start([force])`                 | Starts the execution of tasks in the task manager.                  |
| `stop()`                         | Stops the execution of tasks.                                       |
| `reset()`                        | Resets the task manager to its initial state.                       |
| `clearQueue()`                   | Clears the task queue.                                              |
| `findTask(taskBuilder)`          | Finds a task in the list of tasks.                                  |
| `getTask(taskBuilder)`           | Retrieves a task from the list of tasks or throws.                  |
| `getTaskResult(taskBuilder)`     | Retrieves the result of a task or throws.                           |
| `findLastTask(taskBuilder)`      | Finds the last task of a specific type in the list of tasks.        |
| `getLastTask(taskBuilder)`       | Retrieves the last task of a specific type or throws.               |
| `getLastTaskResult(taskBuilder)` | Retrieves the result of the last task of a specific type or throws. |
| `findTasks(taskBuilder)`         | Finds all tasks of a specific type.                                 |
| `getTasksResults(taskBuilder)`   | Retrieves the results of all tasks of a specific type or throws.    |

#### Flags

The [`TaskManager`](#taskmanager) utilizes a set of flags to control its behavior during task execution. These flags are part of the `TaskManager.Flag` enum and can be set or checked to modify how the [`TaskManager`](#taskmanager) handles tasks.

| Name                 | Default | Description                                                       |
| -------------------- | ------- | ----------------------------------------------------------------- |
| `STOP`               | No      | Flag indicating that the execution loop should stop.              |
| `FAIL_ON_ERROR`      | Yes     | Flag indicating that the execution should stop if any task fails. |
| `PARALLEL_EXECUTION` | No      | Flag for enabling parallel execution of tasks.                    |


### `Task`

Represents an individual task within the task manager system.

#### Properties

| Name      | Description                                                         |
| --------- | ------------------------------------------------------------------- |
| `id`      | Unique identifier of the task.                                      |
| `name`    | Name of the task.                                                   |
| `data`    | Input data for the task.                                            |
| `manager` | [`TaskManager`](#taskmanager) instance to which this task is bound. |

#### Methods

| Name         | Description                                                            |
| ------------ | ---------------------------------------------------------------------- |
| `execute()`  | Executes the task.                                                     |
| `parse()`    | Parses the task, providing a representation suitable for UI rendering. |
| `toString()` | Returns a string representation of the `Task` instance.                |
| `clone()`    | Creates a clone of the current task.                                   |

### `isTask(task, taskBuilder)`

The `isTask` function is a type guard used to check if a given object is an instance of the [`Task`](#task) class and was created with the provided `TaskBuilder`.

### `createTask(config)`

The `createTask` function is a factory method used to create a new `TaskBuilder`. The `TaskBuilder` is a specialized function that, when called, constructs and returns an instance of the [`Task`](#task) class based on the provided configuration.

## Conclusion

The task management system offers a robust and flexible solution for managing tasks in [TypeScript](https://www.typescriptlang.org/) applications. Its design caters to various scenarios where task scheduling and execution are critical.