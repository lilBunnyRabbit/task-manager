import type { GConstructor } from "../../utils/type.util";
import type { Task } from "../task";

export function ExecutionManagerMixin<TBase extends GConstructor<{ tasks: Task[]; queue: Task[] }>>(Base: TBase) {
  return class ExecutionManager extends Base {};
}
