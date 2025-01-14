import { StatusBadge } from "@/components/status-icon";
import { TypeBadge } from "@/components/type-badge";
import { Progress } from "@/components/ui/progress";
import { parseProgress } from "@/utils/misc.util";
import { ParsedTask, Task } from "@package/index";
import React from "react";
import { LogRender } from "./log-render";

interface TaskRenderProps {
  task: Task;
}

export const TaskRender: React.FC<TaskRenderProps> = ({ task }) => {
  const [parsed, setParsed] = React.useState<ParsedTask>(() => task.parse());

  React.useEffect(() => {
    function onAll(this: Task) {
      setParsed(this.parse());
    }

    task.onAll(onAll);

    return () => {
      task.offAll(onAll);
    };
  }, [task]);

  return (
    <div className="flex flex-col gap-4 max-w-full overflow-x-hidden">
      <div className="grid grid-cols-[min-content,1fr,min-content] gap-x-4 items-center justify-between">
        <TypeBadge type="task" />
        <h3>{task.name}</h3>
        <StatusBadge status={task.status} />
      </div>

      <div>
        <div className="font-bold">Status</div>
        <div>{parsed.status}</div>
      </div>

      <div>
        <div className="font-bold">Objects</div>
        <div className="grid grid-cols-[repeat(2,minmax(0px,500px))] gap-x-4">
          <pre className="overflow-x-auto border border-foreground rounded-md bg-foreground/20 p-4 text-sm">
            {task.toString()}
          </pre>

          <pre className="overflow-x-auto border border-foreground rounded-md  bg-foreground/20 p-4 text-sm">
            {task.builder.toString()}
          </pre>
        </div>
      </div>

      <div className="grid grid-cols-[1fr,min-content] whitespace-nowrap">
        <div className="font-bold">Progress</div>
        <div>{parseProgress(task.progress)}</div>

        <Progress value={task.progress * 100} max={100} className="col-span-2" />
      </div>

      {parsed.result && (
        <div>
          <div className="font-bold">Result</div>
          <pre className="overflow-x-auto border border-foreground rounded-md bg-white p-4 text-sm">
            {parsed.result}
          </pre>
        </div>
      )}

      <div>
        <div className="font-bold">Logs</div>
        <div className="overflow-x-auto border border-foreground rounded-md bg-white text-sm">
          <pre className="p-4 w-fit h-fit">
            {task.logs.map((log, i) => {
              return (
                <div key={i}>
                  <LogRender log={log} />
                </div>
              );
            })}
          </pre>
        </div>
      </div>
    </div>
  );
};
