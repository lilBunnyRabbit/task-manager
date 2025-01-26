import { TaskManagerExampleCreate } from "..";

import filesUploadExample from "./files-upload-example";
import filesUploadExampleRaw from "./files-upload-example?raw";
import ciCdExample from "./ci-cd.example";
import ciCdExampleRaw from "./ci-cd.example?raw";

export const examples: TaskManagerExampleCreate[] = [
  {
    title: "Files Upload",
    description: "",
    create: filesUploadExample,
    source: filesUploadExampleRaw,
  },
  {
    title: "CI/CD Pipeline",
    description: "",
    create: ciCdExample,
    source: ciCdExampleRaw,
  },
];
