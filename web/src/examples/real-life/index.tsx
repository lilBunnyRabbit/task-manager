import { TaskManagerExampleCreate } from "..";

import apiRequestExample from "./api-request.example";
import apiRequestExampleRaw from "./api-request.example?raw";
import ciCdExample from "./ci-cd.example";
import ciCdExampleRaw from "./ci-cd.example?raw";
import filesUploadExample from "./files-upload.example";
import filesUploadExampleRaw from "./files-upload.example?raw";
import imageProcessingExample from "./image-processing.example";
import imageProcessingExampleRaw from "./image-processing.example?raw";

export const examples: TaskManagerExampleCreate[] = [
  {
    id: "real-life-file-upload",
    title: "File Upload",
    description: (
      <>
        This example demonstrates a multi-step file upload workflow using <code>TaskManager</code> and{" "}
        <code>TaskGroup</code>. It consists of an <code>Initiate Upload</code> task that prepares file metadata, an{" "}
        <code>Upload Parts</code> task that uploads chunks of the file with retry handling, and a{" "}
        <code>Complete Upload</code> task that finalizes the process. Task querying is used to retrieve intermediate
        results, and progress tracking ensures visibility into the upload status.
      </>
    ),
    create: filesUploadExample,
    source: filesUploadExampleRaw,
  },
  {
    id: "real-life-ci-cd-pipeline",
    title: "CI/CD Pipeline",
    description: (
      <>
        This example showcases an automated <strong>CI/CD pipeline</strong> using <code>TaskManager</code> and{" "}
        <code>TaskGroup</code>. It includes a <code>Build Code</code> task that compiles the project, a{" "}
        <code>Run Tests</code> task that executes multiple test cases in parallel, and a <code>Deploy Code</code> task
        that ensures deployment only if tests pass. The pipeline is configured with the <code>CONTINUE_ON_ERROR</code>{" "}
        flag, allowing execution to proceed even if some tests fail.
      </>
    ),
    create: ciCdExample,
    source: ciCdExampleRaw,
  },
  {
    id: "real-life-image-processing",
    title: "Image Processing",
    description: (
      <>
        This example demonstrates an image processing workflow using <code>TaskManager</code> and <code>TaskGroup</code>
        . It includes a <code>Load Image</code> task that fetches the image and converts it to a data URL, a{" "}
        <code>Resize Image</code> task that scales it down, a <code>Convert Image</code> task that applies a
        black-and-white filter, and a <code>Watermark</code> task that adds a text overlay. Task querying is used to
        pass intermediate results between steps, and execution continues even if some tasks fail due to the{" "}
        <code>CONTINUE_ON_ERROR</code> flag.
      </>
    ),
    create: imageProcessingExample,
    source: imageProcessingExampleRaw,
  },
  {
    id: "real-life-api-request",
    title: "API Request Batching",
    description: (
      <>
        This example simulates an API request system using <code>TaskManager</code> and <code>TaskGroup</code>. It
        includes a <code>Create Client</code> task that initializes a mock API client, along with <code>GET</code>,{" "}
        <code>POST</code>, and <code>DELETE</code> tasks for handling requests. The requests are executed both
        sequentially and in parallel using <code>ExecutionMode.SEQUENTIAL</code> and <code>ExecutionMode.PARALLEL</code>
        . Error handling is managed with the <code>CONTINUE_ON_ERROR</code> flag to allow independent request execution.
      </>
    ),
    create: apiRequestExample,
    source: apiRequestExampleRaw,
  },
];
