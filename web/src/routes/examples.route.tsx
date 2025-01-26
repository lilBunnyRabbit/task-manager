import { Button } from "@/components/ui/button";
import {
  examples,
  flagExamples,
  queryExamples,
  simpleExamples,
  TaskManagerExample,
  TaskManagerExampleCreate,
} from "@/examples";
import { Manager } from "@/lib/manager";
import { ChevronRightIcon } from "lucide-react";
import React from "react";

export default function ExamplesRoute(): React.ReactNode {
  const [example, setExample] = React.useState<{ example: TaskManagerExample; timestamp: number }>({
    example: {
      ...examples[0],
      taskManager: examples[0].create(),
    },
    timestamp: Date.now(),
  });

  const createExample = React.useCallback((example: TaskManagerExampleCreate) => {
    setExample({
      example: {
        ...example,
        taskManager: example.create(),
      },
      timestamp: Date.now(),
    });
  }, []);

  return (
    <>
      <div className="fixed top-14 left-0 bottom-0 w-[300px] border-r border-foreground bg-foreground/20 p-4 text-foreground flex flex-col gap-y-1">
        <h3 className="text-xl font-semibold text-foreground px-4 pb-2 mb-2 border-b border-b-foreground/40">
          Simple Examples
        </h3>

        {simpleExamples.map((example, i) => {
          return (
            <Button key={`example-${i}`} variant="nav" onClick={() => createExample(example)}>
              <div className="truncate">{example.title}</div>
              <ChevronRightIcon />
            </Button>
          );
        })}

        <h3 className="text-xl font-semibold text-foreground px-4 pb-2 mb-2 mt-2 border-b border-b-foreground/40">
          Query Examples
        </h3>

        {queryExamples.map((example, i) => {
          return (
            <Button key={`example-${i}`} variant="nav" onClick={() => createExample(example)}>
              <div className="truncate">{example.title}</div>
              <ChevronRightIcon />
            </Button>
          );
        })}

        <h3 className="text-xl font-semibold text-foreground px-4 pb-2 mb-2 mt-2 border-b border-b-foreground/40">
          Flag Examples
        </h3>

        {flagExamples.map((example, i) => {
          return (
            <Button key={`example-${i}`} variant="nav" onClick={() => createExample(example)}>
              <div className="truncate">{example.title}</div>
              <ChevronRightIcon />
            </Button>
          );
        })}

        <h3 className="text-xl font-semibold text-foreground px-4 pb-2 mb-2 mt-2 border-b border-b-foreground/40">
          Examples
        </h3>

        {examples.map((example, i) => {
          return (
            <Button key={`example-${i}`} variant="nav" onClick={() => createExample(example)}>
              <div className="truncate">{example.title}</div>
              <ChevronRightIcon />
            </Button>
          );
        })}
      </div>

      <Manager
        key={`example-${example.example.title}-${example.timestamp}`}
        className="h-full overflow-hidden ml-[299px]"
        example={example.example}
      />
    </>
  );
}
