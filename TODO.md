[x] event refactoring
[x] TaskError implementation
[x] enum -> objects
[x] manager add tasks ...tasks
[x] TaskFlowController - manager, query
[x] Parent access
[x] TypeDoc - generates into public
[x] TypeDoc with version name, link to website
[x] BaseURL
[ ] Update README
[ ] Fix Examples
[ ] Flow controller needs error or maybe just add to query?
[ ] Task/TaskGroup timestamps

[-] TaskGroup - Replace `create` with `tasks()` and `tasks=[]`
[ ] Nested stop
[ ] Serialize
[ ] Controller - pass controller to task (stop)
[ ] Retries, timeout
[ ] Query filtering
[ ] Dynamic group tasks - define before execute with query options
[ ] Access parent query on taskgroup tasks create
[ ] Optimize TaskGroup bind()
[ ] `createTask(name: string, execute: (...T) => R)`
[ ] `createGroup(name: string, tasks: ExecutableTask[])` `createGroup(name: string, tasks: (...T) => ExecutableTask[])`
[ ] Fix `TaskGroup` clone
