import { createTask, createTaskGroup, ExecutionMode, TaskManager } from "@lilbunnyrabbit/task-manager";
import { randomInt, sleep } from "./utils";

interface InitData {
  file: { id: string; name: string; size: number; type: string };
  completeUrl: string;
  parts: Array<{ url: string; partNumber: number }>;
}

const initUploadTask = createTask<string, InitData>({
  name: "Initiate Upload",

  parse() {
    switch (this.status) {
      default:
      case "idle": {
        return {
          status: "Waiting to initiate...",
        };
      }
      case "in-progress": {
        return {
          status: `Initiating "file-${this.data}"...`,
        };
      }
      case "error": {
        return {
          status: `Failed to initiate "file-${this.data}"!`,
        };
      }
      case "success": {
        if (this.result.isPresent()) {
          return {
            status: `"file-${this.data}" initiated!`,
            result: JSON.stringify(this.result.get(), null, 2),
          };
        }

        return {
          status: `"file-${this.data}" initiated!`,
        };
      }
    }
  },

  async execute(file: string) {
    this.logger.info(`Initiating "file-${this.data}"`);

    await sleep(500);

    return {
      file: {
        id: file,
        name: `file-${file}`,
        size: randomInt(1_000, 1_000_000),
        type: "text/plain",
      },
      completeUrl: `/complete/${file}`,
      parts: Array(randomInt(1, 10))
        .fill(0)
        .map((_, i) => ({
          url: `/part/${file}/${i + 1}`,
          partNumber: i + 1,
        })),
    };
  },
});

type PartsIds = string[];

const uploadPartsTask = createTask<void, PartsIds>({
  name: "Upload Parts",

  parse() {
    switch (this.status) {
      default:
      case "idle": {
        return {
          status: "Waiting to upload parts...",
        };
      }
      case "in-progress": {
        return {
          status: `Uploading parts...`,
        };
      }
      case "error": {
        return {
          status: "Failed to upload parts!",
        };
      }
      case "success": {
        if (this.result.isPresent()) {
          const result = this.result.get();

          return {
            status: `${result.length} parts uploaded!`,
            result: `ID's: ${result.join(", ")}`,
          };
        }

        return {
          status: `Parts uploaded!`,
        };
      }
    }
  },

  async execute() {
    const initData: InitData = this.query.getLastResult(initUploadTask);

    const randomRetry = randomInt(0, initData.parts.length - 1);

    const ids: PartsIds = [];
    for (let i = 0; i < initData.parts.length; i++) {
      const part = initData.parts[i];

      this.logger.info(`Uploading part ${part.partNumber} to "${part.url}"`);
      await sleep(250);

      if (i === randomRetry) {
        this.logger.warn(`Retrying part ${part.partNumber}`);
        await sleep(250);
      }

      ids.push(`id-${part.partNumber}`);

      this.setProgress((i + 1) / initData.parts.length);
    }

    return ids;
  },
});

interface CompleteData {
  id: string;
  name: string;
  size: number;
  type: string;
  createdAt: string;
}

const completeUploadTask = createTask<void, CompleteData>({
  name: "Complete Upload",

  parse() {
    switch (this.status) {
      default:
      case "idle": {
        return {
          status: "Waiting to complete...",
        };
      }
      case "in-progress": {
        return {
          status: `Completing file upload...`,
        };
      }
      case "error": {
        return {
          status: `Failed to complete file upload!`,
        };
      }
      case "success": {
        if (this.result.isPresent()) {
          const result = this.result.get();

          return {
            status: `File "${result.name}" upload completed!`,
            result: JSON.stringify(result, null, 2),
          };
        }

        return {
          status: "File upload completed!",
        };
      }
    }
  },

  async execute() {
    const initData: InitData = this.query.getLastResult(initUploadTask);
    const ids: PartsIds = this.query.getLastResult(uploadPartsTask);

    this.logger.info("Completing file upload.");
    this.logger.info(`Found ${ids.length} parts: ${ids.join(", ")}`);

    await sleep(randomInt(100, 500));

    return {
      ...initData.file,
      createdAt: new Date().toISOString(),
    };
  },
});

const uploadFileGroup = createTaskGroup({
  name: "Upload File",

  tasks(file: string) {
    return [initUploadTask(file), uploadPartsTask(), completeUploadTask()];
  },
});

export default function () {
  const manager = new TaskManager()
    .setMode(ExecutionMode.PARALLEL)
    .addTasks(
      uploadFileGroup("111"),
      uploadFileGroup("222"),
      uploadFileGroup("333"),
      uploadFileGroup("444"),
      uploadFileGroup("555")
    );

  return manager;
}
