export { examples as flagExamples } from "./flag";
export { examples as queryExamples } from "./query";
export { examples as realLifeExamples } from "./real-life";
export { examples as simpleExamples } from "./simple";
export { examples as otherExamples } from "./other";

import { TaskManager } from "@lilbunnyrabbit/task-manager";

export interface TaskManagerExampleCreate {
  id: string;
  title: string;
  description: React.ReactNode;
  create: () => TaskManager;
  source: string;
}

export interface TaskManagerExample {
  title: string;
  description: React.ReactNode;
  taskManager: TaskManager;
  source: string;
}
