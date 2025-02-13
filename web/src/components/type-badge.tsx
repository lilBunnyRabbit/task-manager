import { cn } from "@/utils/ui.util";
import React from "react";

export type BadgeTypes = "manager" | "group" | "task";

const config: Record<BadgeTypes, { label: string; className: string }> = {
  manager: {
    label: "manager",
    className: "bg-info/40 text-info dark:bg-info/20",
  },
  group: {
    label: "group",
    className:
      "bg-success/40 text-success dark:bg-success/20",
  },
  task: {
    label: "task",
    className:
      "bg-primary/40 text-primary dark:bg-primary/20",
  },
};

interface TypeBadgeProps {
  type: BadgeTypes;
  className?: string;
}

export const TypeBadge: React.FC<TypeBadgeProps> = ({ type, className: externalClassName }) => {
  const { label, className } = config[type];

  return (
    <span className={cn("px-2 py-0.5 rounded-md text-xs [&>span]:brightness-[.75] dark:[&>span]:filter-none", className, externalClassName)}>
      <span>{label}</span>
    </span>
  );
};
