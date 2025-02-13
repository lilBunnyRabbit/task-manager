import React from "react";
import { cn } from "../utils";

interface SectionProps {
  id?: string;
  className?: string;
  rootClassName?: string;
  children: React.ReactNode;
}

export const Section: React.FC<SectionProps> = ({ id, className, rootClassName, children }) => {
  return (
    <section id={id} className={cn("w-full h-fit px-8", rootClassName)}>
      <div className={cn("container mx-auto", className)}>{children}</div>
    </section>
  );
};
