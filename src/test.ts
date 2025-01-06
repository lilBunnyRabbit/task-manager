import { EventEmitter } from "@lilbunnyrabbit/utils";
import { Task } from "./task";

class TestTaskExecutor<TEvents extends Record<PropertyKey, unknown> = {}> extends EventEmitter<
  {
    progress: number;
  } & TEvents
> {
  queue: Task[] = [];
  tasks: Task[] = [];
}

class TestTaskManager extends TestTaskExecutor<{ change: void }> {
  tesT() {
    this.emit("change");
  }
}
