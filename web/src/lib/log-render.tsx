import { LogEntry } from "@package/index";
import React from "react";
import { cn } from "../utils/ui.util";

interface LogRenderProps {
  log: LogEntry;
}

export const LogRender: React.FC<LogRenderProps> = ({ log }) => {
  return (
    <pre
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
    </pre>
  );
};
