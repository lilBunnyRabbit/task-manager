import { CodeBlock, CopyCodeBlock } from "@/components/code-block";
import { GithubIcon, NpmIcon } from "@/components/icons";
import { ToTop } from "@/components/to-top";
import { Button } from "@/components/ui/button";
import { LINK } from "@/config";
import demoExample from "@/examples/demo.example";
import { FeatureCard, FeaturedPackageCard, FeatureHorizontal, UseCaseCard } from "@/lib/landing/feature-card";
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
  FileTextIcon,
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
  ShoppingCartIcon,
  SparklesIcon,
  TargetIcon,
  UserIcon,
  WorkflowIcon,
} from "lucide-react";
import React from "react";
import { Link } from "react-router";

const example = demoExample();

export default function LandingPageRoute(): React.ReactNode {
  return (
    <>
      <Section
        rootClassName="bg-gradient-to-b from-background to-primary/10"
        className="max-w-5xl flex flex-col items-center py-32"
      >
        <h1 className="text-7xl text-center">Manage complex tasks with type-safe simplicity.</h1>

        <div className="text-xl text-center mt-8 max-w-3xl">
          A flexible and powerful task management system built with TypeScript. Queue tasks, execute them sequentially
          or in parallel, and monitor their progress with ease.
        </div>

        <div className="flex gap-2 mt-8">
          <Button
            size="lg"
            className="bg-foreground hover:bg-foreground/20 hover:text-foreground !no-underline"
            asChild
          >
            <Link to="/examples">
              Get Started <ArrowRightIcon />
            </Link>
          </Button>

          <Button size="lg" className="bg-primary hover:bg-primary/20 hover:text-primary !no-underline" asChild>
            <a href={LINK.GitHub}>
              <GitBranchIcon /> View on GitHub
            </a>
          </Button>
        </div>
      </Section>

      <Section rootClassName="bg-gradient-to-b from-primary/10 to-primary/20" className="pb-16">
        {/* <h2 className="text-3xl font-bold text-center mb-12">Powerful Features</h2> */}

        {/* <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 opacity-50">
          <FeatureCard
            icon={WorkflowIcon}
            title="Task Management"
            description="Manage task execution, queuing, and progress tracking with full control over execution flow."
          />
          <FeatureCard
            icon={BoxIcon}
            title="Encapsulated Tasks"
            description="Each task encapsulates its own logic, data, and execution state with custom error handling."
          />
          <FeatureCard
            icon={ListIcon}
            title="Queue System"
            description="Add tasks to a queue and execute them sequentially or in parallel based on your needs."
          />
          <FeatureCard
            icon={PlayCircleIcon}
            title="Progress Monitoring"
            description="Track task progress in real-time with detailed reporting and error handling capabilities."
          />
        </div> */}

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

      <Section
        rootClassName="border-y border-y-foreground py-16"
        className="grid grid-cols-1 xl:grid-cols-2 gap-x-16 gap-y-8"
      >
        <div>
          <h2 className="text-3xl font-bold mb-4">Simple to Use</h2>
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

        <div className="rounded-lg overflow-hidden border border-foreground bg-foreground ">
          <div className="text-background text-sm w-full px-3 py-1 font-mono">task-manager.example.ts</div>
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
    uploadTask(new File(["Example 3"], "example-3.txt")),
  );

// Start execution with event handling
manager.on("success", () => console.log("All files uploaded!"));
await manager.start();`}
          />
        </div>
      </Section>

      <Section
        rootClassName="border-b border-b-foreground py-16"
        className="grid grid-cols-1 xl:grid-cols-2 gap-x-16 gap-y-8"
      >
        <div className="rounded-lg overflow-hidden border border-foreground bg-foreground order-1 xl:-order-1">
          <div className="text-background text-sm w-full px-3 py-1 font-mono">task-group.example.ts</div>
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
await fetchUsers.on("success", () => {
  console.log("Users Deleted");
}).execute();`}
          />
        </div>

        <div>
          <h2 className="text-3xl font-bold mb-4">Standalone Groups</h2>
          <p className="mb-8">
            For tasks that don’t require extensive orchestration,{" "}
            <code className="text-sm bg-primary/10 text-primary rounded-md px-1.5">TaskGroup</code> is all you need.
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

      <Section rootClassName="py-16 bg-gradient-to-b from-foreground/20 via-background to-foreground/20 border-b border-b-foreground">
        <h2 className="text-3xl font-bold mb-4 text-center">Try It Out</h2>
        <p className="mb-8 text-center mx-auto max-w-4xl">
          Experience the power of our Task Management System with this interactive demo. See how tasks are executed,
          track their progress, and observe real-time updates.
        </p>

        <div className="border border-foreground bg-foreground rounded-lg overflow-hidden">
          <ManagerPreview className="bg-background" taskManager={example}>
            {({ taskManager, setSelected }) => (
              <div className="flex items-center justify-between text-background pl-10 pr-4 py-2">
                <div className="flex gap-2 items-center">
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
                    className="hover:bg-orange-100 bg-orange-200 text-orange-700"
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

      <Section rootClassName="py-16 bg-background border-b border-b-foreground">
        <h2 className="text-3xl font-bold mb-4 text-center">Get Started in Seconds</h2>
        <p className="mb-8 text-center mx-auto max-w-4xl">
          Task Management System is designed for quick integration and ease of use. Follow these simple steps to get up
          and running with powerful task management in your project.
        </p>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-semibold mb-2 text-foreground">1. Install the Package</h3>

            <CopyCodeBlock code="npm install @lilbunnyrabbit/task-manager" />
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2 text-foreground">2. Import and Use</h3>

            <div className="rounded-lg overflow-hidden border border-foreground bg-foreground ">
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

      <Section rootClassName="py-16 bg-gradient-to-b from-foreground/20 via-background to-foreground/20 border-b border-b-foreground">
        <h2 className="text-3xl font-bold mb-4 text-center">Use Cases</h2>
        <p className="mb-8 text-center mx-auto max-w-4xl">
          Explore practical examples of how this task management system can simplify workflows, from file uploads to
          CI/CD pipelines, API processing, and more.
        </p>
        <div className="text-red-500 text-xl">TODO: FIX EXAMPLES</div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* TODO: Check and update examples */}
          <UseCaseCard
            title="File Upload (with Preflight)"
            description="Streamline the file upload process by preparing metadata, splitting files into chunks, uploading each chunk, and finalizing the process with a preflight check to ensure all parts are correctly uploaded."
            icon={FileIcon}
            code={`// Preflight task
const preflightTask = createTask<{ fileName: string }, void>({
  name: "Preflight Check",
  async execute({ fileName }) {
    // Ensure upload readiness
    console.log(\`Checking preflight for \${fileName}\`);
  },
});

// File chunk upload task
const uploadChunkTask = createTask<{ chunk: Blob }, void>({
  name: "Upload File Chunk",
  async execute({ chunk }) {
    // Upload the chunk
    console.log("Uploading chunk...");
  },
});

// File upload group
const fileUploadGroup = createTaskGroup({
  name: "File Upload Workflow",
  mode: "sequential",
  tasks(file, chunks) {
    return [
      preflightTask({ fileName: file.name }),
      ...chunks.map(chunk => uploadChunkTask({ chunk })),
    ];
  },
});
`}
          />

          <UseCaseCard
            title="CI/CD Pipeline"
            description="Run a comprehensive pipeline by building the application, executing tests, deploying to staging, and releasing to production."
            icon={WorkflowIcon}
            code={`// Build task
const buildTask = createTask<void, void>({
  name: "Build Application",
  async execute() {
    console.log("Building application...");
  },
});

// Test task
const testTask = createTask<void, void>({
  name: "Run Tests",
  async execute() {
    console.log("Running tests...");
  },
});

// CI/CD pipeline group
const ciCdPipeline = createTaskGroup({
  name: "CI/CD Pipeline",
  mode: "sequential",
  tasks() {
    return [buildTask(), testTask()];
  },
});
`}
          />

          <UseCaseCard
            title="Order Fulfillment"
            description="Automate order processing by validating the order, allocating inventory, generating shipping labels, and notifying customers."
            icon={ShoppingCartIcon}
            code={`// Order processing task
const processOrderTask = createTask<{ orderId: string }, void>({
  name: "Process Order",
  async execute({ orderId }) {
    console.log(\`Processing order \${orderId}\`);
  },
});

// Notify customer task
const notifyCustomerTask = createTask<{ orderId: string }, void>({
  name: "Notify Customer",
  async execute({ orderId }) {
    console.log(\`Notifying customer for order \${orderId}\`);
  },
});

// Order fulfillment group
const orderFulfillmentGroup = createTaskGroup({
  name: "Order Fulfillment Workflow",
  mode: "sequential",
  tasks(orderId) {
    return [processOrderTask({ orderId }), notifyCustomerTask({ orderId })];
  },
});
`}
          />

          <UseCaseCard
            title="Image Processing"
            description="Perform a series of image processing steps such as resizing, compressing, applying filters, and saving the output."
            icon={ImageIcon}
            code={`// Resize image task
const resizeImageTask = createTask<{ dimensions: { width: number; height: number } }, void>({
  name: "Resize Image",
  async execute({ dimensions }) {
    console.log(\`Resizing image to \${dimensions.width}x\${dimensions.height}\`);
  },
});

// Image processing group
const imageProcessingGroup = createTaskGroup({
  name: "Image Processing Workflow",
  mode: "sequential",
  tasks(image, dimensions) {
    return [resizeImageTask({ dimensions })];
  },
});
`}
          />

          <UseCaseCard
            title="Document Conversion"
            description="Convert documents between formats such as Word, PDF, and Markdown, while ensuring accurate formatting and metadata preservation."
            icon={FileTextIcon}
            code={`// Convert document task
const convertDocumentTask = createTask<{ format: string }, void>({
  name: "Convert Document",
  async execute({ format }) {
    console.log(\`Converting document to \${format}\`);
  },
});

// Document conversion group
const documentConversionGroup = createTaskGroup({
  name: "Document Conversion Workflow",
  mode: "sequential",
  tasks(document, format) {
    return [convertDocumentTask({ format })];
  },
});
`}
          />

          <UseCaseCard
            title="API Data Fetch and Processing"
            description="Fetch data from multiple APIs, process the results, and store the final output."
            icon={ServerIcon}
            code={`// Fetch API data task
const fetchDataTask = createTask<{ url: string }, any>({
  name: "Fetch API Data",
  async execute({ url }) {
    console.log(\`Fetching data from \${url}\`);
  },
});

// API data processing group
const apiDataProcessingGroup = createTaskGroup({
  name: "API Data Fetch and Processing",
  mode: "sequential",
  tasks(urls) {
    return urls.map(url => fetchDataTask({ url }));
  },
});
`}
          />

          <UseCaseCard
            title="User Account Cleanup"
            description="Clean up inactive user accounts by identifying unused accounts, notifying users, and deactivating accounts in bulk."
            icon={UserIcon}
            code={`// Deactivate user task
const deactivateUserTask = createTask<{ userId: string }, void>({
  name: "Deactivate User",
  async execute({ userId }) {
    console.log(\`Deactivating user \${userId}\`);
  },
});

// User cleanup group
const userCleanupGroup = createTaskGroup({
  name: "User Account Cleanup",
  mode: "sequential",
  tasks(userIds) {
    return userIds.map(userId => deactivateUserTask({ userId }));
  },
});
`}
          />

          <UseCaseCard
            title="Inventory Management"
            description="Track and update inventory by scanning items, verifying stock levels, and generating restock orders."
            icon={BoxIcon}
            code={`// Update inventory task
const updateInventoryTask = createTask<{ itemId: string; quantity: number }, void>({
  name: "Update Inventory",
  async execute({ itemId, quantity }) {
    console.log(\`Updating inventory for item \${itemId} with quantity \${quantity}\`);
  },
});

// Inventory management group
const inventoryManagementGroup = createTaskGroup({
  name: "Inventory Management Workflow",
  mode: "sequential",
  tasks(items) {
    return items.map(item => updateInventoryTask(item));
  },
});
`}
          />
        </div>
      </Section>

      <Section rootClassName="py-16 bg-background border-b border-b-foreground">
        <h2 className="text-3xl font-bold mb-4 text-center">Related Packages</h2>
        <p className="mb-8 text-center mx-auto max-w-4xl">
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

      <footer className="bg-gradient-to-b from-primary/20 to-background border-t border-foreground/20 py-12 px-8">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="flex flex-col items-start">
              <h3 className="font-semibold mb-4">Links</h3>
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
              <h3 className="font-semibold mb-4">Contact</h3>
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
              <h3 className="font-semibold mb-4">Contribution</h3>
              <ul className="space-y-2">
                <li>
                  <a href={`${LINK.GitHub}/pulls`} target="_blank" rel="noopener noreferrer" className="flex items-center">
                    <GithubIcon className="mr-2 size-4" />
                    Pull Requests
                  </a>
                </li>
                <li>
                  <a href={`${LINK.GitHub}/issues`} target="_blank" rel="noopener noreferrer" className="flex items-center">
                    <GithubIcon className="mr-2 size-4" />
                    Issues
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Support</h3>
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

          <div className="mt-8 pt-8 border-t border-foreground/20 flex flex-col items-center justify-between space-y-4 sm:flex-row sm:space-y-0">
            <p className="text-foreground text-sm">MIT © 2024-present Andraž Mesarič-Sirec. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <ToTop />
    </>
  );
}

interface SectionProps {
  className?: string;
  rootClassName?: string;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ className, rootClassName, children }) => {
  return (
    <section className={cn("w-full h-fit px-8", rootClassName)}>
      <div className={cn("container mx-auto", className)}>{children}</div>
    </section>
  );
};
