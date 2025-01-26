import { SourceDialog } from "@/components/source-dialog";
import { AllStatus, StatusIcon } from "@/components/status-icon";
import { BadgeTypes, TypeBadge } from "@/components/type-badge";
import { Button, ButtonProps } from "@/components/ui/button";
import { TaskManagerExample } from "@/examples";
import { ExecutableTask, ExecutionMode, Task, TaskManager, TaskManagerFlag } from "@lilbunnyrabbit/task-manager";
import { ChevronRightIcon, Code2Icon } from "lucide-react";
import React from "react";
import { cn } from "../utils/ui.util";
import "./manager.css";
import { ExecutableTaskRender } from "./models/executable-task-render";
import { TaskManagerRender } from "./models/task-manager-render";

interface ManagerProps {
  example: TaskManagerExample;
  className?: string;
  source?: string;
}

export const Manager: React.FC<ManagerProps> = ({ example, className }) => {
  const taskManager = React.useMemo(() => example.taskManager, [example]);

  return (
    <div
      className={cn(
        "relative grid grid-cols-1 grid-rows-[min-content,min-content,1fr] h-full max-w-full overflow-x-hidden",
        className
      )}
    >
      <div className="pl-10 pr-8 pt-6 mb-6">
        <div className="flex items-start justify-between">
          <h2 className="text-3xl font-bold">{example.title ?? "Unknown Example"}</h2>
          <SourceDialog title={example.title ?? "Unknown Example"} description="Source code" source={example.source}>
            <Button size="icon" className="border">
              <Code2Icon className="!size-5" />
            </Button>
          </SourceDialog>
        </div>

        {example.description && <p className="mt-4 example-description pr-32">{example.description}</p>}
      </div>

      <ManagerPreview className="w-full max-h-full overflow-hidden" taskManager={taskManager}>
        {({ taskManager, setSelected }) => (
          <div className="flex gap-2 items-center flex-wrap border-y border-y-foreground px-10 py-4">
            <Button
              variant="action"
              className={
                taskManager.isStatus("in-progress", "success")
                  ? "bg-red-200 border-red-700 text-red-700"
                  : taskManager.isStatus("error")
                  ? "bg-amber-200 border-amber-700 text-amber-700"
                  : "bg-lime-200 border-lime-700 text-lime-700"
              }
              disabled={
                taskManager.isStatus("success") ||
                (taskManager.hasFlag(TaskManagerFlag.STOP) && taskManager.isStatus("in-progress")) ||
                (taskManager.isStatus("error") && taskManager.isEmptyQueue)
              }
              onClick={() => {
                if (taskManager.isStatus("in-progress")) {
                  return taskManager.stop();
                }

                taskManager.start(taskManager.isStatus("error"));
              }}
            >
              {taskManager.isStatus("in-progress", "success")
                ? "Stop"
                : taskManager.isStatus("idle")
                ? "Start"
                : "Continue"}{" "}
              {taskManager.isStatus("error") && "(force)"}
            </Button>
            <Button
              variant="action"
              className="bg-orange-200 border-orange-700 text-orange-700"
              disabled={taskManager.isStatus("in-progress", "idle")}
              onClick={() => {
                taskManager.reset();
                setSelected(undefined);
              }}
            >
              Reset
            </Button>
            <Button
              variant="action"
              className="bg-blue-200 border-blue-700 text-blue-700"
              disabled={taskManager.isEmptyQueue}
              onClick={() => taskManager.clearQueue()}
            >
              Clear Queue
            </Button>
          </div>
        )}
      </ManagerPreview>
    </div>
  );
};

interface ManagerPreviewProps {
  taskManager: TaskManager;
  className?: string;
  children?: React.FC<{
    taskManager: TaskManager;
    setSelected: React.Dispatch<React.SetStateAction<ExecutableTask | undefined>>;
  }>;
}

export const ManagerPreview: React.FC<ManagerPreviewProps> = ({ taskManager, className, children: Children }) => {
  const [selected, setSelected] = React.useState<ExecutableTask | undefined>();

  const counterState = React.useState(0);

  const onSelect = React.useCallback((selected?: ExecutableTask) => {
    setSelected((s) => {
      if (s?.id === selected?.id) {
        return undefined;
      }

      return selected;
    });
  }, []);

  React.useEffect(() => {
    function onAll(this: TaskManager) {
      counterState[1]((c) => c + 1);
    }

    taskManager.onAll(onAll);

    return () => {
      taskManager.offAll(onAll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskManager]);

  React.useEffect(
    () => () => {
      setSelected(undefined);
    },
    []
  );

  return (
    <>
      {Children && <Children taskManager={taskManager} setSelected={setSelected} />}

      <div className={cn("grid grid-cols-[min-content,1fr]", className)}>
        <div className="border-r border-r-foreground max-h-full overflow-y-auto">
          <div className="p-4">
            <NodeList
              mode={taskManager.mode}
              node={
                <NodeButton
                  data={{
                    status: taskManager.status,
                    name: "Task Manager",
                    type: "manager",
                  }}
                  data-active={!selected}
                  onClick={() => setSelected(undefined)}
                />
              }
            >
              {taskManager.tasks.map((task) => (
                <TreeRender key={`task-${task.id}`} task={task} selected={selected} onSelect={onSelect} />
              ))}
            </NodeList>
          </div>
        </div>

        <div className="p-8 max-w-full overflow-x-hidden max-h-full overflow-y-auto">
          <div className="border border-foreground rounded-md p-4 bg-foreground/10">
            {selected && <ExecutableTaskRender key={`selected-${selected.id}`} task={selected} />}
            {!selected && <TaskManagerRender taskManager={taskManager} />}
          </div>
        </div>
      </div>
    </>
  );
};

interface TreeRenderProps {
  task: ExecutableTask;
  selected?: ExecutableTask;
  onSelect: (task: ExecutableTask) => void;
}

const TreeRender: React.FC<TreeRenderProps> = ({ task, selected, onSelect }) => {
  if (task instanceof Task) {
    return (
      <NodeButton
        data={{
          status: task.status,
          name: task.name,
          type: "task",
        }}
        className={cn(task.status === "idle" && "opacity-60")}
        data-active={selected?.id === task.id}
        data-highlight={selected?.builder.id === task.builder.id}
        onClick={() => onSelect(task)}
      />
    );
  }

  return (
    <NodeList
      sub
      mode={task.mode}
      node={
        <NodeButton
          data={{
            status: task.status,
            name: task.name,
            type: "group",
          }}
          className={cn(task.status === "idle" && "opacity-60")}
          data-active={selected?.id === task.id}
          data-highlight={selected?.builder.id === task.builder.id}
          onClick={() => onSelect(task)}
        />
      }
    >
      {task.tasks.map((task) => (
        <TreeRender key={`task-${task.id}`} task={task} selected={selected} onSelect={onSelect} />
      ))}
    </NodeList>
  );
};

interface NodeButtonProps {
  data: {
    status: AllStatus;
    type: BadgeTypes;
    name: React.ReactNode;
  };
}

const NodeButton: React.FC<NodeButtonProps & Omit<ButtonProps, keyof NodeButtonProps>> = ({
  data,
  className,
  ...props
}) => {
  return (
    <Button
      type="button"
      variant="chevron"
      className={cn(
        "grid grid-cols-[min-content,1fr,min-content] gap-x-2 items-center whitespace-nowrap min-w-fit w-full text-left px-2 font-normal",
        className
      )}
      {...props}
    >
      <StatusIcon status={data.status} />
      <div>{data.name}</div>
      <TypeBadge type={data.type} className="ml-2" />
    </Button>
  );
};

interface NodeListProps {
  node: React.ReactNode;
  sub?: boolean;
  mode?: ExecutionMode;
  children: React.ReactNode;
}

const NodeList: React.FC<NodeListProps> = ({ node, sub, mode, children }) => {
  const [open, setOpen] = React.useState(true);

  return (
    <div className={cn(sub && "-ml-6")}>
      <div className="flex items-center gap-x-2">
        <Button size="icon" variant="transparent" className="w-4" onClick={() => setOpen((o) => !o)}>
          <ChevronRightIcon className={cn(open && "rotate-90")} />
        </Button>

        {node}
      </div>

      {open && (
        <div
          className={cn(
            "ml-2 pl-10 pt-1 space-y-1 border-l border-l-foreground/50 relative",
            mode === ExecutionMode.PARALLEL && "border-dashed"
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
};
