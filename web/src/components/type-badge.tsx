import { cn } from "@/utils/ui.util";
import React from "react";

export type BadgeTypes = "manager" | "group" | "task";

const config: Record<BadgeTypes, { label: string; className: string }> = {
  manager: {
    label: "manager",
    className: "bg-purple-500/20 text-purple-800",
  },
  group: {
    label: "group",
    className: "bg-blue-500/20 text-blue-800",
  },
  task: {
    label: "task",
    className: "bg-foreground/20 text-foreground",
  },
};

interface TypeBadgeProps {
  type: BadgeTypes;
  className?: string;
}

export const TypeBadge: React.FC<TypeBadgeProps> = ({ type, className: externalClassName }) => {
  const { label, className } = config[type];

  return <span className={cn("px-2 py-0.5 rounded-md text-xs", className, externalClassName)}>{label}</span>;
};
