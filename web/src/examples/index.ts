export { examples as simpleExamples } from "./simple";
export { examples as queryExamples } from "./query";
export { examples as flagExamples } from "./flag";

import { TaskManager } from "@lilbunnyrabbit/task-manager";

import calculationExample from "./calculation-example";
import calculationExampleRaw from "./calculation-example?raw";
import ciCdExample from "./ci-cd.example";
import ciCdExampleRaw from "./ci-cd.example?raw";
import filesUploadExample from "./files-upload-example";
import filesUploadExampleRaw from "./files-upload-example?raw";
import groupParallelExample from "./group-parallel-example";
import groupParallelExampleFail from "./group-parallel-example-fail";
import groupParallelExampleFailRaw from "./group-parallel-example-fail?raw";
import groupParallelExampleRaw from "./group-parallel-example?raw";
import prallelExample from "./prallel-example";
import prallelExampleFail from "./prallel-example-fail";
import prallelExampleFailRaw from "./prallel-example-fail?raw";
import prallelExampleRaw from "./prallel-example?raw";

// Query examples, flags examples, error handling

export interface TaskManagerExampleCreate {
  title: string;
  description: React.ReactNode;
  create: () => TaskManager;
  source: string;
}

export interface TaskManagerExample {
  title: string;
  description: React.ReactNode;
  taskManager: TaskManager;
  source: string;
}

export const examples: TaskManagerExampleCreate[] = [
  {
    title: "Calculation Example",
    description: "",
    create: calculationExample,
    source: calculationExampleRaw,
  },
  {
    title: "Parallel Example",
    description: "",
    create: prallelExample,
    source: prallelExampleRaw,
  },
  {
    title: "Parallel Example (Fail)",
    description: "",
    create: prallelExampleFail,
    source: prallelExampleFailRaw,
  },
  {
    title: "Group Parallel Example",
    description: "",
    create: groupParallelExample,
    source: groupParallelExampleRaw,
  },
  {
    title: "Group Parallel Example (Fail)",
    description: "",
    create: groupParallelExampleFail,
    source: groupParallelExampleFailRaw,
  },
  {
    title: "Files Upload",
    description:
      "Streamline the file upload process by preparing metadata, splitting files into chunks, uploading each chunk, and finalizing the process with a preflight check to ensure all parts are correctly uploaded.",
    create: filesUploadExample,
    source: filesUploadExampleRaw,
  },
  {
    title: "CI/CD Pipeline",
    description: "Run a comprehensive pipeline by building the application, executing tests and deploying.",
    create: ciCdExample,
    source: ciCdExampleRaw,
  },
];
