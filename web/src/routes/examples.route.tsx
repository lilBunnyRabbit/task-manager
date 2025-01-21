import { Button } from "@/components/ui/button";
import { examples, TaskManagerExample } from "@/examples";
import { Manager } from "@/lib/manager";
import { ChevronRightIcon } from "lucide-react";
import React from "react";

export default function ExamplesRoute(): React.ReactNode {
  const [example, setExample] = React.useState<TaskManagerExample>({
    ...examples[0],
    taskManager: examples[0].create(),
  });

  React.useEffect(() => {
    console.log(example);
  }, [example]);

  return (
    <>
      <div className="fixed top-14 left-0 bottom-0 w-[300px] border-r border-foreground bg-foreground p-4 text-background flex flex-col gap-y-1">
        <h4 className="mb-4 border-b border-b-background px-4 pb-2">Examples</h4>

        {examples.map((example, i) => {
          return (
            <Button
              key={`example-${i}`}
              variant="nav"
              onClick={() =>
                setExample({
                  ...example,
                  taskManager: example.create(),
                })
              }
            >
              <div className="truncate">{example.title}</div>
              <ChevronRightIcon />
            </Button>
          );
        })}
      </div>

      <Manager key={`example-${example.title}`} className="min-h-dvh ml-[299px]" example={example} />
    </>
  );
}
