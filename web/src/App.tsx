import React from "react";
import { Button } from "./components/ui/button";
import { examples, TaskManagerExample } from "./examples";
import { TaskManagerRender } from "./lib/task-manager-render";

function App() {
  const [example, setExample] = React.useState<TaskManagerExample>({
    ...examples[0],
    taskManager: examples[0].create(),
  });

  React.useEffect(() => {
    console.log(example);
  }, [example]);

  return (
    <>
      <div className="fixed top-0 left-0 bottom-0 w-[300px] border-r bg-foreground p-4 text-background flex flex-col gap-y-1">
        <h3 className="mb-4 border-b border-b-background">Examples</h3>

        {examples.map((example) => {
          return (
            <Button
              variant="ghost"
              className="justify-start"
              onClick={() =>
                setExample({
                  ...example,
                  taskManager: example.create(),
                })
              }
            >
              {example.title}
            </Button>
          );
        })}
      </div>

      <TaskManagerRender className="min-h-dvh ml-[299px]" example={example} />
    </>
  );
}

export default App;
