import { LabelSection } from "@/components/label-section";
import { StatusBadge } from "@/components/status-icon";
import { TypeBadge } from "@/components/type-badge";
import { Progress } from "@/components/ui/progress";
import { parseProgress } from "@/utils/misc.util";
import { GlobalEvent } from "@lilbunnyrabbit/event-emitter";
import { ParsedTask, Task, TaskEvents } from "@lilbunnyrabbit/task-manager";
import React from "react";
import { EventsRender } from "./events-render";
import { LogRender } from "./log-render";
import { LiveText } from "@/components/live-text";

interface TaskRenderProps {
  task: Task;
}

export const TaskRender: React.FC<TaskRenderProps> = ({ task }) => {
  const [events, setEvents] = React.useState<Array<{ event: GlobalEvent<TaskEvents>; timestamp: string }>>([]);
  const [parsed, setParsed] = React.useState<ParsedTask>(() => task.parse());

  React.useEffect(() => {
    function onAll(this: Task, event: GlobalEvent<TaskEvents>) {
      setParsed(this.parse());
      setEvents((e) => [...e, { event, timestamp: new Date().toISOString() }]);
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

      <LabelSection label="Status">
        <div>{parsed.status}</div>
      </LabelSection>

      <LabelSection
        asChild
        label={
          <div className="flex justify-between items-baseline whitespace-nowrap">
            <div>Progress</div>
            <div className="font-normal text-sm">{parseProgress(task.progress)}</div>
          </div>
        }
      >
        <Progress value={task.progress * 100} max={100} />
      </LabelSection>

      <LabelSection label="Objects">
        <div className="grid grid-cols-[repeat(2,minmax(0px,500px))] gap-x-4">
          <pre className="overflow-x-auto border border-foreground rounded-md bg-foreground/10 p-4 text-sm">
            {task.toString()}
          </pre>

          <pre className="overflow-x-auto border border-foreground rounded-md  bg-foreground/10 p-4 text-sm">
            {task.builder.toString()}
          </pre>
        </div>
      </LabelSection>

      {parsed.result && (
        <LabelSection label="Result">
          <pre className="overflow-x-auto border border-foreground rounded-md bg-foreground/10 p-4 text-sm">
            {parsed.result}
          </pre>
        </LabelSection>
      )}

      <LabelSection label="Logs">
        <div className="overflow-x-auto border border-foreground rounded-md bg-foreground/10 text-sm">
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
      </LabelSection>

      <LabelSection label={<LiveText>Events</LiveText>}>
        <div className="overflow-x-auto border border-foreground rounded-md bg-foreground/10 text-sm">
          <EventsRender events={events} />
        </div>
      </LabelSection>
    </div>
  );
};
