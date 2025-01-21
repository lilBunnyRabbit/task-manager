import React from "react";
import { CodeBlock } from "./code-block";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";

interface SourceDialogProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  source: string;
  children?: React.ReactNode;
}

export const SourceDialog: React.FC<SourceDialogProps> = ({ title, description, source, children }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-5xl h-fit max-h-[80dvh] overflow-hidden px-0 pb-0 border-none bg-foreground grid-rows-[min-content,1fr] [&_svg]:text-background">
        <DialogHeader className="px-6">
          {title && <DialogTitle className="text-background">{title}</DialogTitle>}
          {description && <DialogDescription className="text-background/80">{description}</DialogDescription>}
        </DialogHeader>

        <div className="h-full max-h-full overflow-y-scroll">
          <CodeBlock value={source} readOnly />
        </div>
      </DialogContent>
    </Dialog>
  );
};
