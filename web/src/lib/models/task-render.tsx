import { LabelSection } from "@/components/label-section";
import { LiveText } from "@/components/live-text";
import { StatusBadge } from "@/components/status-icon";
import { TypeBadge } from "@/components/type-badge";
import { Progress } from "@/components/ui/progress";
import { parseProgress } from "@/utils/misc.util";
import { GlobalEvent } from "@lilbunnyrabbit/event-emitter";
import { ParsedTask, Task, TaskEvents } from "@lilbunnyrabbit/task-manager";
import { isUndefined } from "@lilbunnyrabbit/utils";
import React from "react";
import { EventsRender } from "./events-render";
import { LogsRender } from "./logs-render";

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
        <Progress
          value={task.progress * 100}
          max={100}
          status={task.isStatus("success", "error") ? (task.status as "success" | "error") : undefined}
        />
      </LabelSection>

      <LabelSection label="Objects">
        <div className="grid grid-cols-[repeat(2,minmax(0px,500px))] gap-x-4">
          <div className="border border-foreground rounded-md bg-background overflow-hidden">
            <pre className="overflow-x-auto p-4 text-sm h-full">{task.toString(true)}</pre>
          </div>

          <div className="border border-foreground rounded-md bg-background overflow-hidden">
            <pre className="overflow-x-auto p-4 text-sm h-full">{task.builder.toString(true)}</pre>
          </div>
        </div>
      </LabelSection>

      {!isUndefined(parsed.result) && (
        <LabelSection label="Result">
          {parsed.result!.startsWith("data:image") ? (
            <img src={parsed.result} className="border border-foreground bg-background rounded-md object-contain h-[22rem] max-w-full"></img>
          ) : (
            <div className="border border-foreground rounded-md bg-background overflow-hidden">
              <pre className="overflow-x-auto p-4 text-sm">{parsed.result}</pre>
            </div>
          )}
        </LabelSection>
      )}

      <LabelSection label="Logs">
        <LogsRender logs={task.logs} />
      </LabelSection>

      <LabelSection label={<LiveText>Events</LiveText>}>
        <EventsRender events={events} />
      </LabelSection>
    </div>
  );
};
