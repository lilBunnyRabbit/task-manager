import React from "react";

interface LiveTextProps {
  children?: React.ReactNode;
}

export const LiveText: React.FC<LiveTextProps> = ({ children }) => {
  return (
    <div className="flex items-center gap-2">
      {children}

      <div className="size-[10px] inline-block bg-error rounded-full animate-pulse duration-1000" />
    </div>
  );
};
