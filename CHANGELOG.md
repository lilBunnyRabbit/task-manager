# @lilbunnyrabbit/task-manager

## 1.0.1

### Patch Changes

- 5139bfc: docs: GitHub Sponsor button

## 1.0.0

### Major Changes

- bbf0d98: - Joined `Task` generics (`TSpec`)
  - Integrated `@lilbunnyrabbit/event-emitter` and `@lilbunnyrabbit/event-optional`
  - Replaced `createTaskId()` with `uuid`
  - Implemented `TaskGroup` as a `Task`-like object with execution similar to `TaskManager`
  - Extracted `TaskQuery` for `Task`/`TaskGroup` querying logic
  - Introduced `TaskLogger` to replace `Task` errors and warnings with a logging system
  - Replaced enums with objects
  - Added `FlowController` to manage execution flow for `Task`/`TaskGroup` (pending, active, completed)
  - Implemented `TaskError`/`TasksError` for structured error handling across `Task`, `TaskGroup` and `TaskManager`
  - Refactored `Task`, `TaskGroup`, and `TaskManager` events (removed/replaced `"change"` event)
  - Updated JSDoc
  - Updated README.md
  - Created Examples Website
  - Developed Landing Page
  - Refactored event system
  - Added Parent access to tasks
  - Renamed `LINEAR` execution mode to `SEQUENTIAL`

## 0.0.2

### Patch Changes

- 1342dbe: Fixes TaskManager "success" emit

## 0.0.1

### Patch Changes

- f7e170e: Fixes docs link
