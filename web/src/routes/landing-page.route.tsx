import { CodeBlock, CopyCodeBlock } from "@/components/code-block";
import { GithubIcon, NpmIcon } from "@/components/icons";
import { ToTop } from "@/components/to-top";
import { Button } from "@/components/ui/button";
import { LINK } from "@/config";
import demoExample from "@/examples/other/demo.example";
import { FeatureCard, FeaturedPackageCard, FeatureHorizontal, UseCaseCard } from "@/lib/landing/feature-card";
import { Section } from "@/lib/landing/section";
import { ManagerPreview } from "@/lib/manager";
import { cn } from "@/lib/utils";
import { LATEST_API_REFERENCE } from "@/utils/link.util";
import { TaskManagerFlag } from "@lilbunnyrabbit/task-manager";
import {
  ArrowRightIcon,
  BoxIcon,
  FeatherIcon,
  FileIcon,
  FileInput,
  GitBranchIcon,
  ImageIcon,
  LayersIcon,
  LayoutGridIcon,
  MailIcon,
  PlayIcon,
  RefreshCwIcon,
  RepeatIcon,
  ServerIcon,
  ShieldIcon,
  SparklesIcon,
  TargetIcon,
  WorkflowIcon,
} from "lucide-react";
import React from "react";
import { Link, useSearchParams } from "react-router";

const example = demoExample();

export default function LandingPageRoute(): React.ReactNode {
  const [searchParams] = useSearchParams();

  React.useEffect(() => {
    const sectionId = searchParams.get("section");
    if (sectionId) {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }
  }, [searchParams]);

  return (
    <>
      <HeaderSection className="bg-gradient-to-b from-background to-primary/10" />

      <FeaturesSection className="bg-gradient-to-b from-primary/10 to-primary/20" />

      <SimpleSection className="border-y border-y-foreground py-16" />

      <GroupsSection className="border-b border-b-foreground py-16" />

      <TryItSection className="border-b border-b-foreground bg-gradient-to-b from-foreground/20 via-background to-foreground/20 py-16" />

      <GetStartedSection className="border-b border-b-foreground bg-background py-16" />

      <UseCasesSection className="border-b border-b-foreground bg-gradient-to-b from-foreground/20 via-background to-foreground/20 py-16" />

      <RelatedSection className="border-b border-b-foreground bg-background py-16" />

      <FooterSection className="border-t border-foreground/20 bg-gradient-to-b from-primary/20 to-background px-8 py-12" />

      <ToTop />
    </>
  );
}

interface SectionProps {
  className: string;
}

const HeaderSection: React.FC<SectionProps> = ({ className: rootClassName }) => {
  return (
    <Section id="section-header" rootClassName={rootClassName} className="flex max-w-5xl flex-col items-center py-32">
      <h1 className="text-center text-7xl">Manage complex tasks with type-safe simplicity.</h1>

      <div className="mt-8 max-w-3xl text-center text-xl">
        A flexible and powerful task management system built with TypeScript. Queue tasks, execute them sequentially or
        in parallel, and monitor their progress with ease.
      </div>

      <div className="mt-8 flex gap-2">
        <Button size="lg" className="bg-foreground !no-underline hover:bg-foreground/20 hover:text-foreground" asChild>
          <Link to="/examples">
            Get Started <ArrowRightIcon />
          </Link>
        </Button>

        <Button size="lg" className="bg-primary !no-underline hover:bg-primary/20 hover:text-primary" asChild>
          <a href={LINK.GitHub}>
            <GitBranchIcon /> View on GitHub
          </a>
        </Button>
      </div>
    </Section>
  );
};

const FeaturesSection: React.FC<SectionProps> = ({ className: rootClassName }) => {
  return (
    <Section id="section-features" rootClassName={rootClassName} className="pb-16">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        <FeatureCard
          icon={WorkflowIcon}
          title="Task Orchestration"
          description="Manage execution flow with sequential or parallel modes. Coordinate complex task dependencies effortlessly."
        />
        <FeatureCard
          icon={PlayIcon}
          title="Progress Tracking"
          description="Monitor task progress in real-time with built-in progress tracking and event emission for granular control."
        />
        <FeatureCard
          icon={ShieldIcon}
          title="Type Safety"
          description="Built with TypeScript for complete type safety. Define input and output types for your tasks with confidence."
        />
        <FeatureCard
          icon={LayersIcon}
          title="Composable Workflows"
          description="Build modular applications by combining smaller task groups into reusable and scalable workflows."
        />
        <FeatureCard
          icon={RefreshCwIcon}
          title="Error Recovery"
          description="Robust error handling with the ability to continue execution even when tasks fail. Detailed error reporting included."
        />
        <FeatureCard
          icon={LayoutGridIcon}
          title="Query Interface"
          description="Powerful query interface for accessing task results and managing task state across your application."
        />
      </div>
    </Section>
  );
};

const SimpleSection: React.FC<SectionProps> = ({ className: rootClassName }) => {
  return (
    <Section
      id="section-simple"
      rootClassName={rootClassName}
      className="grid grid-cols-1 gap-x-16 gap-y-8 xl:grid-cols-2"
    >
      <div>
        <h2 className="mb-4 text-3xl font-bold">Simple to Use</h2>
        <p className="mb-8">
          Create and manage tasks with a clean, intuitive API. Full TypeScript support ensures type safety throughout
          your application.
        </p>

        <div className="space-y-4">
          <FeatureHorizontal
            icon={BoxIcon}
            title="Type-Safe Tasks"
            description="Define input and output types for complete type safety."
          />

          <FeatureHorizontal
            icon={SparklesIcon}
            title="Event-Driven"
            description="React to task lifecycle events with built-in event emitters."
          />

          <FeatureHorizontal
            icon={RepeatIcon}
            title="Reusable Workflows"
            description="Define and reuse task workflows for consistent and efficient processing across projects."
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-foreground bg-foreground">
        <div className="w-full px-3 py-1 font-mono text-sm text-background">task-manager.example.ts</div>
        <CodeBlock
          readOnly
          value={`import { createTask, ExecutionMode, TaskManager } from "@lilbunnyrabbit/task-manager";

// Create a task with type-safe input and output
const uploadTask = createTask<File, string>({
  name: "Upload File",
  async execute(file) {
    // Task implementation with progress tracking
    this.setProgress(0.5); // Update progress
    return file.name;
  },
});

// Create a task manager and execute tasks
const manager = new TaskManager()
  .setMode(ExecutionMode.PARALLEL) // Run tasks in parallel
  .addTasks(
    uploadTask(new File(["Example 1"], "example-1.txt")),
    uploadTask(new File(["Example 2"], "example-2.txt")),
    uploadTask(new File(["Example 3"], "example-3.txt"))
  );

// Start execution with event handling
manager.on("success", () => console.log("All files uploaded!"));
await manager.start();`}
        />
      </div>
    </Section>
  );
};

const GroupsSection: React.FC<SectionProps> = ({ className: rootClassName }) => {
  return (
    <Section
      id="section-groups"
      rootClassName={rootClassName}
      className="grid grid-cols-1 gap-x-16 gap-y-8 xl:grid-cols-2"
    >
      <div className="order-1 overflow-hidden rounded-lg border border-foreground bg-foreground xl:-order-1">
        <div className="w-full px-3 py-1 font-mono text-sm text-background">task-group.example.ts</div>
        <CodeBlock
          readOnly
          value={`import { createTask, createTaskGroup, ExecutionMode, TaskGroupFlag } from "@lilbunnyrabbit/task-manager";

const fetchUserTask = createTask<string, { id: string; username: string }>({
  name: "Fetch User",
  async execute(id) {
    // Fetch user
    return { id, username: \`user-\${id}\` };
  },
});

const fetchUsersGroup = createTaskGroup({
  name: "Fetch Users",
  mode: ExecutionMode.PARALLEL,
  flags: [TaskGroupFlag.CONTINUE_ON_ERROR],
  tasks(ids: string[]) {
    return ids.map((id) => fetchUserTask(id));
  },
});

const fetchUsers = fetchUsersGroup(["1", "2", "3"]);
await fetchUsers
  .on("success", () => {
    console.log("Users Deleted");
  })
  .execute();`}
        />
      </div>

      <div>
        <h2 className="mb-4 text-3xl font-bold">Standalone Groups</h2>
        <p className="mb-8">
          For tasks that don’t require extensive orchestration,{" "}
          <code className="rounded-md bg-primary/10 px-1.5 text-sm text-primary">TaskGroup</code> is all you need.
          Execute workflows directly, whether sequentially or in parallel, with simplicity and efficiency.
        </p>

        <div className="space-y-4">
          <FeatureHorizontal
            icon={TargetIcon}
            title="Focused Workflows"
            description="Focus on the logic of your workflow without worrying about orchestration."
          />

          <FeatureHorizontal
            icon={FeatherIcon}
            title="Lightweight and Fast"
            description="Minimal setup and direct execution ensure a lightweight and fast workflow."
          />

          <FeatureHorizontal
            icon={FileInput}
            title="Flexible Inputs"
            description="Accept dynamic inputs and adapt tasks based on runtime parameters."
          />
        </div>
      </div>
    </Section>
  );
};

const TryItSection: React.FC<SectionProps> = ({ className: rootClassName }) => {
  return (
    <Section id="section-try-it" rootClassName={rootClassName}>
      <h2 className="mb-4 text-center text-3xl font-bold">Try It Out</h2>
      <p className="mx-auto mb-8 max-w-4xl text-center">
        Experience the power of our Task Management System with this interactive demo. See how tasks are executed, track
        their progress, and observe real-time updates.
      </p>

      <div className="overflow-hidden rounded-lg border border-foreground bg-foreground">
        <ManagerPreview className="bg-background" taskManager={example}>
          {({ taskManager, setSelected }) => (
            <div className="flex items-center justify-between py-2 pl-10 pr-4 text-background">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "hover:bg-background",
                    taskManager.isStatus("in-progress", "success")
                      ? "bg-red-200 hover:bg-red-100 text-red-700"
                      : taskManager.isStatus("error")
                      ? "bg-amber-200 hover:bg-amber-100 text-amber-700"
                      : "bg-lime-200 hover:bg-lime-100 text-lime-700"
                  )}
                  disabled={
                    taskManager.isStatus("success") ||
                    (taskManager.hasFlag(TaskManagerFlag.STOP) && taskManager.isStatus("in-progress")) ||
                    (taskManager.isStatus("error") && taskManager.isEmptyQueue)
                  }
                  onClick={() => {
                    if (taskManager.isStatus("in-progress")) {
                      return taskManager.stop();
                    }

                    taskManager.start(taskManager.isStatus("error"));
                  }}
                >
                  {taskManager.isStatus("in-progress", "success")
                    ? "Stop"
                    : taskManager.isStatus("idle")
                    ? "Start"
                    : "Continue"}{" "}
                  {taskManager.isStatus("error") && "(force)"}
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="bg-orange-200 text-orange-700 hover:bg-orange-100"
                  disabled={taskManager.isStatus("in-progress", "idle")}
                  onClick={() => {
                    taskManager.reset();
                    setSelected(undefined);
                  }}
                >
                  Reset
                </Button>
              </div>
              <div>Task Manager Demo</div>
            </div>
          )}
        </ManagerPreview>
      </div>
    </Section>
  );
};

const GetStartedSection: React.FC<SectionProps> = ({ className: rootClassName }) => {
  return (
    <Section id="section-get-started" rootClassName={rootClassName}>
      <h2 className="mb-4 text-center text-3xl font-bold">Get Started in Seconds</h2>
      <p className="mx-auto mb-8 max-w-4xl text-center">
        Task Management System is designed for quick integration and ease of use. Follow these simple steps to get up
        and running with powerful task management in your project.
      </p>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
        <div>
          <h3 className="mb-2 text-xl font-semibold text-foreground">1. Install the Package</h3>

          <CopyCodeBlock code="npm install @lilbunnyrabbit/task-manager" />
        </div>
        <div>
          <h3 className="mb-2 text-xl font-semibold text-foreground">2. Import and Use</h3>

          <div className="overflow-hidden rounded-lg border border-foreground bg-foreground">
            <CodeBlock
              readOnly
              value={`import { createTask, TaskManager } from "@lilbunnyrabbit/task-manager";

const myTask = createTask({
  name: "My First Task",
  async execute() {
    // Your task logic here
  }
});

const manager = new TaskManager()
  .addTask(myTask())
  .start();`}
            />
          </div>
        </div>
      </div>
    </Section>
  );
};

const UseCasesSection: React.FC<SectionProps> = ({ className: rootClassName }) => {
  return (
    <Section id="section-use-cases" rootClassName={rootClassName}>
      <h2 className="mb-4 text-center text-3xl font-bold">Use Cases</h2>
      <p className="mx-auto mb-8 max-w-4xl text-center">
        Explore practical examples of how this task management system can simplify workflows, from file uploads to CI/CD
        pipelines, API processing, and more.
      </p>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
        <UseCaseCard
          title="File Upload"
          description="Efficiently handle file uploads by processing metadata, uploading in chunks, and finalizing the upload."
          icon={FileIcon}
          code={`// Initialize file upload
const initUploadTask = createTask<File, { parts: number }>({
  name: "Initiate Upload",
  async execute(file) {
    this.logger.info(\`Initializing upload for "\${file.name}" (\${file.size} bytes)\`);
    return { parts: Math.ceil(file.size / 1024) }; // Simulating chunk count
  },
});

// Upload file parts
const uploadPartsTask = createTask<File, string>({
  name: "Upload Parts",
  async execute(file) {
    const { parts } = this.query.getLastResult(initUploadTask);
    for (let i = 1; i <= parts; i++) {
      this.logger.info(\`Uploading chunk \${i}/\${parts} of "\${file.name}"\`);
      this.setProgress(i / parts);
    }
    return \`/complete/\${file.name}\`;
  },
});

// Complete file upload
const completeUpload = createTask<void, void>({
  name: "Complete Upload",
  async execute() {
    const completeUrl = this.query.getLastResult(uploadPartsTask);
    console.log(\`Completing file "\${completeUrl}"\`);
  },
});

// File upload group
const fileUpload = createTaskGroup({
  name: "File Upload",
  tasks(file: File) {
    return [initUploadTask(file), uploadPartsTask(file), completeUpload()];
  },
});`}
        />

        <UseCaseCard
          title="CI/CD Pipeline"
          description="Automate builds, testing, and deployment in a structured pipeline."
          icon={WorkflowIcon}
          code={`// Build application
const buildTask = createTask<string, string>({
  name: "Build Application",
  async execute(project) {
    this.logger.info(\`Building project "\${project}"\`);
    return \`\${project}-build\`;
  },
});

// Run tests
const testTask = createTask<void, boolean>({
  name: "Run Tests",
  async execute() {
    const build = this.query.getLastResult(buildTask);
    this.logger.info(\`Running tests for "\${build}"\`);
    return Math.random() > 0.1; // Simulating test pass/fail
  },
});

// Deploy application
const deployTask = createTask<void, void>({
  name: "Deploy Application",
  async execute() {
    const build = this.query.getLastResult(buildTask);
    const testsPassed = this.query.getLastResult(testTask);
    if (!testsPassed) throw new Error(\`Tests failed for "\${build}"\`);
    this.logger.info(\`Deploying "\${build}"\`);
  },
});

// CI/CD pipeline
const ciCdPipeline = createTaskGroup({
  name: "CI/CD Pipeline",
  tasks(project: string) {
    return [buildTask(project), testTask(), deployTask()];
  },
});`}
        />

        <UseCaseCard
          title="Image Processing"
          description="Perform a series of image transformations such as resizing, filtering, and applying watermarks."
          icon={ImageIcon}
          code={`// Load image
const loadImageTask = createTask<File, HTMLImageElement>({
  name: "Load Image",
  async execute(file) {
    this.logger.info(\`Loading image "\${file.name}"\`);
    return new Image(); // Simulating image loading
  },
});

// Resize image
const resizeImageTask = createTask<void, HTMLCanvasElement>({
  name: "Resize Image",
  async execute() {
    const image = this.query.getLastResult(loadImageTask);
    this.logger.info(\`Resizing image\`);
    return document.createElement("canvas"); // Simulating resize
  },
});

// Apply filter
const filterImageTask = createTask<void, HTMLCanvasElement>({
  name: "Apply Filter",
  async execute() {
    const canvas = this.query.getLastResult(resizeImageTask);
    this.logger.info(\`Applying filter to image\`);
    return canvas;
  },
});

// Image processing group
const imageProcessing = createTaskGroup({
  name: "Image Processing",
  tasks(file: File) {
    return [loadImageTask(file), resizeImageTask(), filterImageTask()];
  },
});`}
        />

        <UseCaseCard
          title="API Data Fetch"
          description="Fetch multiple API endpoints in parallel, process responses, and analyze results in a structured workflow."
          icon={ServerIcon}
          code={`// Fetch API data
const fetchDataTask = createTask<{ url: string }, { url: string; data: unknown }>({
  name: "Fetch Data",
  async execute({ url }) {
    this.logger.info(\`Fetching data from \${url}\`);
    return { url, data: \`Response from \${url}\` }; // Simulating API response
  },
});

// Fetch multiple API endpoints in parallel
const multipleFetchGroup = createTaskGroup({
  name: "Fetch Multiple APIs",
  mode: ExecutionMode.PARALLEL,
  tasks(urls: string[]) {
    return urls.map((url) => fetchDataTask({ url }));
  },
});

// Process API data
const processDataTask = createTask<void, number>({
  name: "Process Data",
  async execute() {
    const results = this.query.getLast(multipleFetchGroup).query.getResults(fetchDataTask);
    this.logger.info(\`Processing \${results.length} responses.\`);
    return results.length; // Simulate processing
  },
});

// API request workflow
const apiRequestGroup = createTaskGroup({
  name: "API Request Workflow",
  mode: ExecutionMode.SEQUENTIAL,
  tasks(urls: string[]) {
    return [multipleFetchGroup(urls), processDataTask()];
  },
});`}
        />
      </div>
    </Section>
  );
};

const RelatedSection: React.FC<SectionProps> = ({ className: rootClassName }) => {
  return (
    <Section id="section-related" rootClassName={rootClassName}>
      <h2 className="mb-4 text-center text-3xl font-bold">Related Packages</h2>
      <p className="mx-auto mb-8 max-w-4xl text-center">
        Explore other packages in the ecosystem used by the Task Manager, providing key utilities and functionality to
        enhance its capabilities.
      </p>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        <FeaturedPackageCard
          npm="@lilbunnyrabbit/event-emitter"
          github="lilBunnyRabbit/event-emitter"
          description="A lightweight and type-safe EventEmitter implementation for TypeScript."
        />
        <FeaturedPackageCard
          npm="@lilbunnyrabbit/optional"
          github="lilBunnyRabbit/optional"
          description="A TypeScript implementation of Java's Optional<T>, a container for nullable values with safe handling."
        />
        <FeaturedPackageCard
          npm="@lilbunnyrabbit/utils"
          github="lilBunnyRabbit/typescript-utils"
          description="TypeScript library containing a collection of utility classes, functions, etc."
        />
      </div>
    </Section>
  );
};

const FooterSection: React.FC<SectionProps> = ({ className }) => {
  return (
    <footer id="section-footer" className={className}>
      <div className="container mx-auto">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="flex flex-col items-start">
            <h3 className="mb-4 font-semibold">Links</h3>
            <ul className="space-y-2">
              <li>
                <a href={LATEST_API_REFERENCE}>API Reference</a>
              </li>
              <li>
                <Link to="/examples">Examples</Link>
              </li>
              <li>
                <Link to="/changelog">Changelog</Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-semibold">Contact</h3>
            <ul className="space-y-2">
              <li>
                <a href={LINK.Email} className="flex items-center">
                  <MailIcon size={16} className="mr-2" />
                  Email
                </a>
              </li>
              <li>
                <a href={LINK.GitHub} target="_blank" rel="noopener noreferrer" className="flex items-center">
                  <GithubIcon className="mr-2 size-4" />
                  GitHub
                </a>
              </li>
              <li>
                <a href={LINK.NPM} target="_blank" rel="noopener noreferrer" className="flex items-center">
                  <NpmIcon className="mr-2 size-4" />
                  NPM
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-semibold">Contribution</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href={`${LINK.GitHub}/pulls`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center"
                >
                  <GithubIcon className="mr-2 size-4" />
                  Pull Requests
                </a>
              </li>
              <li>
                <a
                  href={`${LINK.GitHub}/issues`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center"
                >
                  <GithubIcon className="mr-2 size-4" />
                  Issues
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-semibold">Support</h3>
            <div className="space-y-4">
              <a href="https://www.buymeacoffee.com/lilBunnyRabbit" className="block dark:hidden">
                <img src="https://img.buymeacoffee.com/button-api/?text=Buy me a beer&emoji=🍺&slug=lilBunnyRabbit&button_colour=648096&font_colour=fff6e7&outline_colour=fff6e7&coffee_colour=fff6e7" />
              </a>
              <a href="https://www.buymeacoffee.com/lilBunnyRabbit" className="hidden dark:block">
                <img src="https://img.buymeacoffee.com/button-api/?text=Buy me a beer&emoji=🍺&slug=lilBunnyRabbit&button_colour=b9b6aa&font_colour=1a2b33&outline_colour=1a2b33&coffee_colour=1a2b33" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between space-y-4 border-t border-foreground/20 pt-8 sm:flex-row sm:space-y-0">
          <p className="text-sm text-foreground">MIT © 2024-present Andraž Mesarič-Sirec. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
