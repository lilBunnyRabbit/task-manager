import { cn } from "@/utils/ui.util";
import { TaskGroupStatus, TaskManagerStatus, TaskStatus } from "@lilbunnyrabbit/task-manager";
import { AlertCircleIcon, CheckCircleIcon, ClockIcon, LoaderIcon, PauseIcon } from "lucide-react";
import React from "react";

export type AllStatus = TaskManagerStatus | TaskGroupStatus | TaskStatus;

const config: Record<AllStatus, { label: string; className: string }> = {
  idle: {
    label: "idle",
    className: "bg-foreground/20 text-foreground",
  },
  "in-progress": {
    label: "in-progress",
    className: "bg-info/40 text-info dark:bg-info/20",
  },
  success: {
    label: "success",
    className: "bg-success/40 text-success dark:bg-success/20",
  },
  stopped: {
    label: "stopped",
    className: "bg-warn/40 text-warn dark:bg-warn/20",
  },
  error: {
    label: "error",
    className: "bg-error/40 text-error dark:bg-error/20",
  },
};

const icons: Record<AllStatus, React.ReactNode> = {
  idle: <ClockIcon className="text-foreground" />,
  "in-progress": <LoaderIcon className="text-info animate-spin" />,
  success: <CheckCircleIcon className="text-success" />,
  stopped: <PauseIcon className="text-warn" />,
  error: <AlertCircleIcon className="text-error" />,
};

interface StatusIconProps {
  status: AllStatus;
}

export const StatusIcon: React.FC<StatusIconProps> = ({ status }) => {
  return icons[status];
};

export const StatusBadge: React.FC<StatusIconProps> = ({ status }) => {
  const { label, className } = config[status];

  return (
    <div
      className={cn(
        "px-2 py-0.5 rounded-md text-xs whitespace-nowrap w-fit [&>span]:brightness-[.75] dark:[&>span]:filter-none [&_svg]:h-4 [&_svg]:w-[14px] [&_svg]:flex-shrink-0 [&_svg]:text-current",
        className
      )}
    >
      <span className="flex items-center gap-2">
        {label} {icons[status]}
      </span>
    </div>
  );
};
