import { Button } from "@/components/ui/button";
import {
  otherExamples,
  flagExamples,
  queryExamples,
  realLifeExamples,
  simpleExamples,
  TaskManagerExample,
  TaskManagerExampleCreate,
} from "@/examples";
import { Manager } from "@/lib/manager";
import { ChevronRightIcon } from "lucide-react";
import React from "react";
import { useSearchParams } from "react-router";

const allExamples = [simpleExamples, queryExamples, flagExamples, realLifeExamples, otherExamples];
function findExampleById(id: string) {
  for (const examples of allExamples) {
    for (const example of examples) {
      if (example.id === id) {
        return example;
      }
    }
  }
}

export default function ExamplesRoute(): React.ReactNode {
  const [searchParams, setSearchParams] = useSearchParams();

  const [example, setExample] = React.useState<{ example: TaskManagerExample; timestamp: number }>(() => {
    let example = simpleExamples[0];
    const exampleId = searchParams.get("example");
    if (exampleId) {
      const newExample = findExampleById(exampleId);
      if (newExample) {
        example = newExample;
      }
    }

    return {
      example: {
        ...example,
        taskManager: example.create(),
      },
      timestamp: Date.now(),
    };
  });

  const createExample = React.useCallback(
    (example: TaskManagerExampleCreate) => {
      setSearchParams((params) => {
        params.delete("example");
        params.set("example", example.id);
        return params;
      });

      setExample({
        example: {
          ...example,
          taskManager: example.create(),
        },
        timestamp: Date.now(),
      });
    },
    [setSearchParams]
  );

  return (
    <>
      <div className="fixed top-14 left-0 bottom-0 w-[300px] border-r border-foreground bg-foreground/10 p-4 text-foreground flex flex-col gap-y-1 overflow-y-auto">
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
          Real-Life Examples
        </h3>

        {realLifeExamples.map((example, i) => {
          return (
            <Button key={`example-${i}`} variant="nav" onClick={() => createExample(example)}>
              <div className="truncate">{example.title}</div>
              <ChevronRightIcon />
            </Button>
          );
        })}

        <h3 className="text-xl font-semibold text-foreground px-4 pb-2 mb-2 mt-2 border-b border-b-foreground/40">
          Other Examples
        </h3>

        {otherExamples.map((example, i) => {
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
