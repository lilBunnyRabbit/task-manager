import { ExecutableTask, Task } from "@package/index";
import { TaskGroupRender } from "./task-group-render";
import { TaskRender } from "./task-render";

interface ExecutableTaskRenderProps {
  task: ExecutableTask;
}

export const ExecutableTaskRender: React.FC<ExecutableTaskRenderProps> = ({ task }) => {
  if (task instanceof Task) {
    return <TaskRender task={task} />;
  }

  return <TaskGroupRender taskGroup={task} />;
};
