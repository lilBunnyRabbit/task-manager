import { LiveText } from "@/components/live-text";
import { StatusBadge, StatusIcon } from "@/components/status-icon";
import { TypeBadge } from "@/components/type-badge";
import React from "react";

export default function TestingRoute(): React.ReactNode {
  return (
    <div className="container mx-auto pt-8 space-y-8">
      <Section title="<LiveText />">
        <LiveText>Test</LiveText>
      </Section>

      <div className="grid grid-cols-2 gap-x-8">
        <Section title="<StatusIcon />" className="space-y-2">
          <StatusIcon status="idle" />
          <StatusIcon status="in-progress" />
          <StatusIcon status="success" />
          <StatusIcon status="stopped" />
          <StatusIcon status="error" />
        </Section>

        <Section title="<StatusBadge />" className="space-y-2">
          <StatusBadge status="idle" />
          <StatusBadge status="in-progress" />
          <StatusBadge status="success" />
          <StatusBadge status="stopped" />
          <StatusBadge status="error" />
        </Section>
      </div>

      <div className="grid grid-cols-2 gap-x-8">
        <Section title="<TypeBadge />" className="space-y-2 space-x-2">
          <TypeBadge type="manager" />
          <TypeBadge type="group" />
          <TypeBadge type="task" />
        </Section>
      </div>
    </div>
  );
}

interface SectionProps {
  title: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

const Section: React.FC<SectionProps> = ({ title, children, className }) => {
  return (
    <section className={className}>
      <h3 className="border-b border-b-foreground mb-4">{title}</h3>
      {children}
    </section>
  );
};
