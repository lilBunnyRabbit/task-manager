import { StatusBadge } from "@/components/status-icon";
import { TypeBadge } from "@/components/type-badge";
import { Progress } from "@/components/ui/progress";
import { parseProgress } from "@/utils/misc.util";
import { TaskGroup, TaskGroupFlag } from "@package/index";
import React from "react";

interface TaskGroupRenderProps {
  taskGroup: TaskGroup;
}

export const TaskGroupRender: React.FC<TaskGroupRenderProps> = ({ taskGroup }) => {
  const counterState = React.useState(0);

  React.useEffect(() => {
    function onAll() {
      counterState[1]((c) => c + 1);
    }

    taskGroup.onAll(onAll);

    return () => {
      taskGroup.offAll(onAll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskGroup]);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-[min-content,1fr,min-content] gap-x-4 items-center justify-between">
        <TypeBadge type="group" />
        <h3>{taskGroup.name}</h3>
        <StatusBadge status={taskGroup.status} />
      </div>

      <div>
        <div className="font-bold">Objects</div>
        <div className="grid grid-cols-[repeat(2,minmax(0px,500px))] gap-x-4">
          <pre className="overflow-x-auto border border-foreground rounded-md bg-foreground/20 p-4 text-sm">
            {taskGroup.toString()}
          </pre>

          <pre className="overflow-x-auto border border-foreground rounded-md  bg-foreground/20 p-4 text-sm">
            {taskGroup.builder.toString()}
          </pre>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="font-bold">Mode</div>

          <div>{taskGroup.mode}</div>
        </div>

        <div>
          <div className="font-bold">Flags</div>

          <div>{taskGroup.flags.map((flag) => TaskGroupFlag[flag]).join(", ")}</div>
        </div>
      </div>

      <div className="grid grid-cols-[1fr,min-content] whitespace-nowrap">
        <div className="font-bold">Progress</div>
        <div>{parseProgress(taskGroup.progress)}</div>

        <Progress value={taskGroup.progress * 100} max={100} className="col-span-2" />
      </div>
    </div>
  );
};
