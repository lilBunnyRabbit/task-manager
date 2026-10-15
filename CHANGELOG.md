# @lilbunnyrabbit/task-manager

## 2.0.0

### Major Changes

- 8402459: - **ESM only**: `"type": "module"`, compiled to ES2022 with Node-compatible `.js` import paths; CommonJS `require()` is no longer supported. Requires Node.js 20+ (or a bundler)
  - Replaced `uuid` with `crypto.randomUUID()` and moved `typedoc` to `devDependencies`
  - `Task` has `signal` (its own `AbortSignal`) and `message` / `setMessage()` (emits `param` `"message"`); `ParsedTask` gains `message`
  - `cancel()` on `Task`, `TaskGroup` and `TaskManager`: aborts with an `AbortError`, new `"cancelled"` status and `cancel` event (no `error`/`fail` for a cancellation). Cancellation is cooperative: a running task stays `"in-progress"` until `execute` settles, then ends `"cancelled"` whether it threw or resolved (a late result is discarded). Pending children become `"cancelled"` right away; groups and the manager become `"cancelled"` once their running tasks settle. A task cancelling itself cancels its parent unless `CONTINUE_ON_ERROR` is set. `stop()` still pauses between tasks
  - `retry` task config (`attempts`, `backoff: "fixed" | "exponential"`, `delay_ms`) with abortable delays and a `retry` event; never retries an `AbortError` or after a cancel
  - `TaskManager.retry()` and `TaskGroup.retry()` re-queue failed and cancelled tasks as fresh clones, keep successful tasks and their results, and retry nested groups in place
  - Fixed `clearQueue()` keeping the cleared tasks in `tasks` instead of removing them
  - API docs moved to `docs/api/v2.0.0`
  - Status unions now include `"cancelled"`: exhaustive `switch`/`Record` over `TaskStatus`, `TaskGroupStatus` or `TaskManagerStatus` needs a new case

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
