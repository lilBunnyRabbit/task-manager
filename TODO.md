[ ] event refactoring
[x] TaskError implementation
[x] enum -> objects
[x] manager add tasks ...tasks
[x] TaskFlowController - manager, query
[ ] Nested stop
[ ] Serialize
[ ] Controller - pass controller to task (stop)
[ ] Retries, timeout
[ ] Query filtering
[ ] Dynamic group tasks - define before execute with query options
[ ] TaskGroup - Replace `create` with `tasks()` and `tasks=[]`
[ ] `createTask(name: string, execute: (...T) => R)`
[ ] `createGroup(name: string, tasks: ExecutableTask[])` `createGroup(name: string, tasks: (...T) => ExecutableTask[])`
[ ] Fix `TaskGroup` clone
[ ] Execute on group

[ ] TypeDoc - generates into public