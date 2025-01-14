import { AllStatus, StatusBadge, StatusIcon } from "@/components/status-icon";
import { BadgeTypes, TypeBadge } from "@/components/type-badge";
import { Button, ButtonProps } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { TaskManagerExample } from "@/examples";
import { parseProgress } from "@/utils/misc.util";
import { ExecutableTask, TaskManagerFlag } from "@package/core/task-manager/task-manager.type";
import { Task, TaskManager } from "@package/index";
import { ChevronRightIcon } from "lucide-react";
import React from "react";
import { cn } from "../utils/ui.util";
import { ExecutableTaskRender } from "./executable-task-render";

interface TaskManagerRenderProps {
  example: TaskManagerExample;
  className?: string;
  source?: string;
}

export const TaskManagerRender: React.FC<TaskManagerRenderProps> = ({ example, className }) => {
  const [selected, setSelected] = React.useState<ExecutableTask | undefined>();

  const taskManager = React.useMemo(() => example.taskManager, [example]);

  const [, setHasError] = React.useState(false);
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
    function onChange(this: TaskManager) {
      counterState[1]((c) => c + 1);
    }

    function onFail() {
      setHasError(true);
    }

    taskManager.on("change", onChange);
    taskManager.on("fail", onFail);

    return () => {
      taskManager.off("change", onChange);
      taskManager.off("fail", onFail);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskManager]);

  return (
    <div
      className={cn(
        "relative grid grid-cols-[min-content,1fr] grid-rows-[min-content,1fr] h-full max-w-full overflow-x-hidden",
        className
      )}
    >
      <div className="col-span-2 flex items-center justify-between border-b border-b-foreground px-6 pt-6 pb-4">
        <div>
          <h1 className="mx-6 col-span-2">{example.title ?? "Testing Example"}</h1>
          <div>{example.description}</div>
        </div>

        <div className="flex gap-2 items-center flex-wrap">
          <Button
            className={
              taskManager.isStatus("in-progress", "success")
                ? "bg-red-200"
                : taskManager.isStatus("error")
                ? "bg-red-300 text-white"
                : "bg-green-200"
            }
            disabled={
              taskManager.isStatus("success") ||
              (taskManager.hasFlag(TaskManagerFlag.STOP) && taskManager.isStatus("in-progress")) ||
              (taskManager.isStatus("error") && !taskManager.queue.length)
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
            className="bg-orange-200"
            disabled={taskManager.isStatus("in-progress", "idle")}
            onClick={() => taskManager.reset()}
          >
            Reset
          </Button>
          <Button className="bg-blue-200" disabled={!taskManager.queue.length} onClick={() => taskManager.clearQueue()}>
            Clear Queue
          </Button>
        </div>
      </div>

      <div className="border-r border-r-foreground p-4">
        <NodeList
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

          {taskManager.queue.map((task) => (
            <TreeRender key={`queue-${task.id}`} task={task} selected={selected} onSelect={onSelect} />
          ))}
        </NodeList>
      </div>

      <div className="p-4 max-w-full overflow-x-hidden">
        {selected && <ExecutableTaskRender key={`selected-${selected.id}`} task={selected} />}
        {!selected && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-[min-content,1fr,min-content] gap-x-4 items-center justify-between">
              <TypeBadge type="group" />
              <h3>Task Manager</h3>
              <StatusBadge status={taskManager.status} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="font-bold">Mode</div>

                <div>{taskManager.mode}</div>
              </div>

              <div>
                <div className="font-bold">Flags</div>

                <div>{taskManager.flags.map((flag) => TaskManagerFlag[flag]).join(", ")}</div>
              </div>
            </div>

            <div className="grid grid-cols-[1fr,min-content] whitespace-nowrap">
              <div className="font-bold">Progress</div>
              <div>{parseProgress(taskManager.progress)}</div>

              <Progress value={taskManager.progress * 100} max={100} className="col-span-2" />
            </div>
          </div>
        )}
      </div>
    </div>
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
        onClick={() => onSelect(task)}
      />
    );
  }

  return (
    <NodeList
      sub
      node={
        <NodeButton
          data={{
            status: task.status,
            name: task.name,
            type: "group",
          }}
          className={cn(task.status === "idle" && "opacity-60")}
          data-active={selected?.id === task.id}
          onClick={() => onSelect(task)}
        />
      }
    >
      {task.tasks.map((task) => (
        <TreeRender key={`task-${task.id}`} task={task} selected={selected} onSelect={onSelect} />
      ))}

      {task.queue.map((task) => (
        <TreeRender key={`queue-${task.id}`} task={task} selected={selected} onSelect={onSelect} />
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
      className={cn(
        "grid grid-cols-[min-content,1fr,min-content] gap-x-2 items-center whitespace-nowrap w-full text-left px-2",
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
  children: React.ReactNode;
}

const NodeList: React.FC<NodeListProps> = ({ node, sub, children }) => {
  const [open, setOpen] = React.useState(true);

  return (
    <div className={cn(sub && "-ml-6")}>
      <div className="flex items-center gap-x-2">
        <Button size="icon" variant="chevron" className="w-4" onClick={() => setOpen((o) => !o)}>
          <ChevronRightIcon className={cn(open && "rotate-90")} />
        </Button>

        {node}
      </div>

      {open && <div className="ml-2 pl-10 pt-1 space-y-1 border-l border-l-foreground/50">{children}</div>}
    </div>
  );
};
