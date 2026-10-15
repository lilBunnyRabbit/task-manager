---
"@lilbunnyrabbit/task-manager": major
---

- **ESM only**: `"type": "module"`, compiled to ES2022 with Node-compatible `.js` import paths; CommonJS `require()` is no longer supported. Requires Node.js 20+ (or a bundler)
- Replaced `uuid` with `crypto.randomUUID()` and moved `typedoc` to `devDependencies`
- `Task` has `signal` (its own `AbortSignal`) and `message` / `setMessage()` (emits `param` `"message"`); `ParsedTask` gains `message`
- `cancel()` on `Task`, `TaskGroup` and `TaskManager`: aborts with an `AbortError`, new `"cancelled"` status and `cancel` event (no `error`/`fail` for a cancellation). Cancellation is cooperative: a running task stays `"in-progress"` until `execute` settles, then ends `"cancelled"` whether it threw or resolved (a late result is discarded). Pending children become `"cancelled"` right away; groups and the manager become `"cancelled"` once their running tasks settle. A task cancelling itself cancels its parent unless `CONTINUE_ON_ERROR` is set. `stop()` still pauses between tasks
- `retry` task config (`attempts`, `backoff: "fixed" | "exponential"`, `delay_ms`) with abortable delays and a `retry` event; never retries an `AbortError` or after a cancel
- `TaskManager.retry()` and `TaskGroup.retry()` re-queue failed and cancelled tasks as fresh clones, keep successful tasks and their results, and retry nested groups in place
- Fixed `clearQueue()` keeping the cleared tasks in `tasks` instead of removing them
- API docs moved to `docs/api/v2.0.0`
- Status unions now include `"cancelled"`: exhaustive `switch`/`Record` over `TaskStatus`, `TaskGroupStatus` or `TaskManagerStatus` needs a new case
