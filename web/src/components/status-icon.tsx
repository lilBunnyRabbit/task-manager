import { cn } from "@/utils/ui.util";
import { TaskGroupStatus, TaskManagerStatus, TaskStatus } from "@package/index";
import { AlertCircleIcon, CheckCircleIcon, ClockIcon, LoaderIcon, PauseIcon } from "lucide-react";
import React from "react";

export type AllStatus = TaskManagerStatus | TaskGroupStatus | TaskStatus;

const config: Record<AllStatus, { label: string; className: string }> = {
  idle: {
    label: "idle",
    className: "bg-foreground/20 !text-foreground",
  },
  "in-progress": {
    label: "in-progress",
    className: "bg-foreground/20 !text-foreground",
  },
  success: {
    label: "success",
    className: "bg-green-500/20 !text-green-800",
  },
  stopped: {
    label: "stopped",
    className: "bg-foreground/20 !text-foreground",
  },
  error: {
    label: "error",
    className: "bg-red-500/20 !text-red-800",
  },
};

const icons: Record<AllStatus, React.ReactNode> = {
  idle: <ClockIcon className="text-foreground" />,
  "in-progress": <LoaderIcon className="text-foreground animate-spin" />,
  success: <CheckCircleIcon className="text-green-500" />,
  stopped: <PauseIcon className="text-foreground" />,
  error: <AlertCircleIcon className="text-red-500" />,
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
        "px-2 py-0.5 rounded-md text-xs flex items-center gap-2 whitespace-nowrap [&>svg]:h-4 [&>svg]:w-4 [&>svg]:flex-shrink-0",
        className
      )}
    >
      {label}
      {icons[status]}
    </div>
  );
};
