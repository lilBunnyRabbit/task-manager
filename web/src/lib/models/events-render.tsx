import { safelyParseJson } from "@/utils/misc.util";
import { EventMap, GlobalEvent } from "@lilbunnyrabbit/event-emitter";
import { isUndefined } from "@lilbunnyrabbit/utils";

interface EventsRenderProps {
  events: Array<{ event: GlobalEvent<EventMap>; timestamp: string }>;
}

export const EventsRender: React.FC<EventsRenderProps> = ({ events }) => {
  return (
    <pre className="p-4 w-fit h-fit">
      {events.map(({ event, timestamp }, i) => {
        return (
          <div key={i}>
            [{timestamp}][{event.type.toString()}]{" "}
            {isUndefined(event.data) ? <span className="opacity-50">void</span> : safelyParseJson(event.data)}
          </div>
        );
      })}
    </pre>
  );
};
