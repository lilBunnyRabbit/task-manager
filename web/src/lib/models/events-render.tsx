import { ScrollBottom } from "@/components/scroll-bottom";
import { safelyParseJson } from "@/utils/misc.util";
import { GlobalEvent } from "@lilbunnyrabbit/event-emitter";
import { TaskEvents, TaskGroupEvents, TaskManagerEvents } from "@lilbunnyrabbit/task-manager";
import { isUndefined } from "@lilbunnyrabbit/utils";

interface EventsRenderProps {
  events: Array<{
    event: GlobalEvent<TaskManagerEvents> | GlobalEvent<TaskGroupEvents> | GlobalEvent<TaskEvents>;
    timestamp: string;
  }>;
}

export const EventsRender: React.FC<EventsRenderProps> = ({ events }) => {
  return (
    <div className="border border-foreground rounded-md overflow-x-hidden bg-background">
      <ScrollBottom className="overflow-auto text-sm max-h-[22rem]">
        <pre className="p-4 w-fit h-fit">
          {events.map(({ event, timestamp }, i) => {
            return (
              <div key={i}>
                [{timestamp}][{event.type.toString()}]{" "}
                {"data" in event && !isUndefined(event.data) ? (
                  safelyParseJson(event.data)
                ) : (
                  <span className="opacity-50">void</span>
                )}
              </div>
            );
          })}
        </pre>
      </ScrollBottom>
    </div>
  );
};
