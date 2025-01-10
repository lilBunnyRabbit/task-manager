import type { Prettify } from "@lilbunnyrabbit/utils";
import { v4 as uuidv4 } from "uuid";
import type { Task } from "../task";
import { TaskGroup } from "./task-group";
import type { TaskGroupMode } from "./task-group.type";
import { isTaskGroup } from "./task-group.helper";
import { ExecutableTask } from "../task-manager/task-manager.type";

export interface BuilderIs<TValue> {
  is(task: unknown): task is TValue;
}

export type TaskGroupConfig<TArgs extends unknown[] = []> = {
  name: string;
  mode?: TaskGroupMode;
  create(...args: TArgs): ExecutableTask[];
};

export interface TaskGroupBuilder<TArgs extends unknown[] = []> extends BuilderIs<TaskGroup<TArgs>> {
  (...args: TArgs): TaskGroup<TArgs>;
  id: string;
  taskGroupName: string;
}

export function createTaskGroup<TArgs extends unknown[] = []>({ name, ...config }: TaskGroupConfig<TArgs>) {
  const builder: TaskGroupBuilder<TArgs> = function (...args) {
    return new TaskGroup(builder, args, name, config.mode, config.create(...args));
  };

  builder.id = uuidv4();
  builder.taskGroupName = name;
  builder.toString = function () {
    return `TaskGroupBuilder {\n\tname: ${JSON.stringify(this.taskGroupName)},\n\tid: "${this.id}"\n}`;
  };
  builder.is = (taskGroup: unknown) => isTaskGroup(taskGroup, builder);

  return builder;
}
