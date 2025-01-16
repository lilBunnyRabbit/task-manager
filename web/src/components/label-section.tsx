import React from "react";
import { Slot } from "@radix-ui/react-slot";
import { isObject } from "@lilbunnyrabbit/utils";

interface LabelSectionProps {
  label: React.ReactNode;
  children?: React.ReactNode;
  asChild?: boolean;
}

export const LabelSection: React.FC<LabelSectionProps> = ({ label, children, asChild }) => {
  return (
    <div className="space-y-1">
      {asChild ? <Slot className="font-bold" children={label} /> : <label className="font-bold">{label}</label>}
      {isObject(children) ? children : <div>{children}</div>}
    </div>
  );
};
