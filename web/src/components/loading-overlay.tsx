import { Loader2 } from "lucide-react";
import React from "react";

export const LoadingOverlay: React.FC = () => {
  return (
    <div className="flex items-center justify-center w-full h-full">
      <Loader2 className="h-4 w-4 text-primary animate-spin" />
    </div>
  );
};
