import { Link, Outlet, Route, Routes } from "react-router";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import DocumentationRoute from "./documentation.route";
import ExamplesRoute from "./examples.route";
import LandingPageRoute from "./landing-page.route";
import TestingRoute from "./testing.route";

export const LINK = {
  NPM: "https://www.npmjs.com/package/@lilbunnyrabbit/task-manager",
  GitHub: "https://github.com/lilBunnyRabbit/task-manager",
};

const AppHeader: React.FC = () => {
  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-b-foreground bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 h-14">
        <div className="container flex items-center justify-between mx-auto h-14">
          <div className="flex items-center gap-x-1">
            <Link
              className="font-bold text-primary text-sm font-mono mr-3 bg-primary/10 px-2 py-1 rounded-md whitespace-nowrap"
              to="/"
            >
              @lilbunnyrabbit/task-manager
            </Link>
          </div>

          <div className="flex items-center">
            <div className="space-x-8">
              <Link to="/">Home</Link>
              <Link to="/documentation">Documentation</Link>
              <Link to="/examples">Examples</Link>
            </div>

            <div className="h-full border-r border-r-foreground block"></div>

            <span className="space-x-2">
              <ThemeToggle />
              <Button variant="ghost" size="icon" asChild>
                <a href={LINK.GitHub}>
                  <svg className="fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <title>GitHub</title>
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                </a>
              </Button>

              <Button variant="ghost" size="icon" asChild>
                <a href={LINK.NPM}>
                  <svg
                    viewBox="0 0 256 256"
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    preserveAspectRatio="xMidYMid"
                  >
                    <title>NPM</title>
                    <polygon className="fill-foreground" points="0 256 0 0 256 0 256 256"></polygon>
                    <polygon
                      className="fill-background"
                      points="48 48 208 48 208 208 176 208 176 80 128 80 128 208 48 208"
                    ></polygon>
                  </svg>
                </a>
              </Button>
            </span>
          </div>
        </div>
      </header>

      <main className="min-h-full h-full relative">
        <Outlet />
      </main>
    </>
  );
};

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<AppHeader />}>
        <Route index element={<LandingPageRoute />} />
        <Route path="examples" element={<ExamplesRoute />} />
        <Route path="documentation" element={<DocumentationRoute />} />
        <Route path="testing" element={<TestingRoute />} />
      </Route>
    </Routes>
  );
}
