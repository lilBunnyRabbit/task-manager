import { ScrollBottom } from "@/components/scroll-bottom";
import { LogEntry } from "@lilbunnyrabbit/task-manager";
import React from "react";
import { cn } from "../../utils/ui.util";

interface LogsRenderProps {
  logs: LogEntry[];
}

export const LogsRender: React.FC<LogsRenderProps> = ({ logs }) => {
  return (
    <div className="border border-foreground rounded-md overflow-x-hidden bg-foreground/10">
      <ScrollBottom className="overflow-auto text-sm max-h-[22rem]">
        <pre className="p-4 w-fit h-fit">
          {logs.map((log, i) => {
            return (
              <div
                key={i}
                className={cn(
                  {
                    debug: "text-foreground",
                    info: "text-info",
                    warn: "text-warn",
                    error: "text-error",
                  }[log.level]
                )}
              >
                <span>
                  [{log.timestamp}][{log.level.toUpperCase()}]
                </span>{" "}
                {log.message}
                {log.stack && (
                  <>
                    <br />
                    <pre className="ml-8">{log.stack}</pre>
                  </>
                )}
              </div>
            );
          })}
        </pre>
      </ScrollBottom>
    </div>
  );
};
