import { LabelSection } from "@/components/label-section";
import { StatusBadge } from "@/components/status-icon";
import { TypeBadge } from "@/components/type-badge";
import { Progress } from "@/components/ui/progress";
import { parseProgress } from "@/utils/misc.util";
import { GlobalEvent } from "@lilbunnyrabbit/event-emitter";
import { TaskGroup, TaskGroupEvents, TaskGroupFlag } from "@lilbunnyrabbit/task-manager";
import React from "react";
import { EventsRender } from "./events-render";
import { LiveText } from "@/components/live-text";

interface TaskGroupRenderProps {
  taskGroup: TaskGroup;
}

export const TaskGroupRender: React.FC<TaskGroupRenderProps> = ({ taskGroup }) => {
  const [events, setEvents] = React.useState<Array<{ event: GlobalEvent<TaskGroupEvents>; timestamp: string }>>([]);

  React.useEffect(() => {
    function onAll(event: GlobalEvent<TaskGroupEvents>) {
      setEvents((e) => [...e, { event, timestamp: new Date().toISOString() }]);
    }

    taskGroup.onAll(onAll);

    return () => {
      taskGroup.offAll(onAll);
    };
  }, [taskGroup]);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-[min-content,1fr,min-content] gap-x-4 items-center justify-between">
        <TypeBadge type="group" />
        <h3>{taskGroup.name}</h3>
        <StatusBadge status={taskGroup.status} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <LabelSection label="Mode">{taskGroup.mode}</LabelSection>

        {!!taskGroup.flags.length && (
          <LabelSection label="Flags">{taskGroup.flags.map((flag) => TaskGroupFlag[flag]).join(", ")}</LabelSection>
        )}
      </div>

      <LabelSection
        asChild
        label={
          <div className="flex justify-between items-baseline whitespace-nowrap">
            <div>Progress</div>
            <div className="font-normal text-sm">{parseProgress(taskGroup.progress)}</div>
          </div>
        }
      >
        <Progress value={taskGroup.progress * 100} max={100} />
      </LabelSection>

      <LabelSection label="Objects">
        <div className="grid grid-cols-[repeat(2,minmax(0px,500px))] gap-x-4">
          <div className="border border-foreground rounded-md bg-foreground/10 overflow-hidden">
            <pre className="overflow-x-auto p-4 text-sm h-full">{taskGroup.toString(true)}</pre>
          </div>

          <div className="border border-foreground rounded-md bg-foreground/10 overflow-hidden">
            <pre className="overflow-x-auto p-4 text-sm h-full">{taskGroup.builder.toString(true)}</pre>
          </div>
        </div>
      </LabelSection>

      <LabelSection label={<LiveText>Events</LiveText>}>
        <EventsRender events={events} />
      </LabelSection>
    </div>
  );
};
