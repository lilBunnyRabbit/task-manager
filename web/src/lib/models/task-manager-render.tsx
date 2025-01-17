import { LabelSection } from "@/components/label-section";
import { LiveText } from "@/components/live-text";
import { StatusBadge } from "@/components/status-icon";
import { TypeBadge } from "@/components/type-badge";
import { Progress } from "@/components/ui/progress";
import { parseProgress } from "@/utils/misc.util";
import { GlobalEvent } from "@lilbunnyrabbit/event-emitter";
import { TaskManager, TaskManagerEvents, TaskManagerFlag } from "@lilbunnyrabbit/task-manager";
import React from "react";
import { EventsRender } from "./events-render";

interface TaskManagerRenderProps {
  taskManager: TaskManager;
}

export const TaskManagerRender: React.FC<TaskManagerRenderProps> = ({ taskManager }) => {
  const [events, setEvents] = React.useState<Array<{ event: GlobalEvent<TaskManagerEvents>; timestamp: string }>>([]);

  React.useEffect(() => {
    function onAll(event: GlobalEvent<TaskManagerEvents>) {
      setEvents((e) => [...e, { event, timestamp: new Date().toISOString() }]);
    }

    taskManager.onAll(onAll);

    return () => {
      taskManager.offAll(onAll);
    };
  }, [taskManager]);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-[min-content,1fr,min-content] gap-x-4 items-center justify-between">
        <TypeBadge type="manager" />
        <h3>Task Manager</h3>
        <StatusBadge status={taskManager.status} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <LabelSection label="Mode">{taskManager.mode}</LabelSection>

        {!!taskManager.flags.length && (
          <LabelSection label="Flags">{taskManager.flags.map((flag) => TaskManagerFlag[flag]).join(", ")}</LabelSection>
        )}
      </div>

      <LabelSection
        asChild
        label={
          <div className="flex justify-between items-baseline whitespace-nowrap">
            <div>Progress</div>
            <div className="font-normal text-sm">{parseProgress(taskManager.progress)}</div>
          </div>
        }
      >
        <Progress value={taskManager.progress * 100} max={100} />
      </LabelSection>

      <LabelSection label={<LiveText>Events</LiveText>}>
        <EventsRender events={events} />
      </LabelSection>
    </div>
  );
};
