import { GithubIcon, NpmIcon } from "@/components/icons";
import { ThemeToggle } from "@/components/theme-toggle";
import { LINK } from "@/config";
import { cn } from "@/lib/utils";
import { LATEST_API_REFERENCE } from "@/utils/link.util";
import { Link, Outlet, useMatch } from "react-router";

export const AppLayout: React.FC = () => {
  const isFull = !!useMatch("/examples");

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-b-foreground bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 h-14 px-8">
        <div className={cn("flex items-center justify-between h-14 transition-transform", !isFull && "container mx-auto")}>
          <div className="flex items-center gap-x-1">
            <Link
              className="font-bold text-primary text-sm font-mono mr-3 bg-primary/10 px-2 py-1 rounded-md whitespace-nowrap"
              to="/"
            >
              @lilbunnyrabbit/task-manager
            </Link>
          </div>

          <div className="flex items-center">
            <div className="space-x-4 md:space-x-8">
              <a href={LATEST_API_REFERENCE}>API Reference</a>

              <Link to="/examples">Examples</Link>
            </div>

            <div className="flex items-center gap-x-4 md:gap-x-6 border-l border-l-foreground/40 ml-4 md:ml-6 pl-4 md:pl-6">
              <ThemeToggle />

              <a href={LINK.NPM} className="[&_svg]:size-5">
                <NpmIcon />
              </a>

              <a href={LINK.GitHub} className="[&_svg]:size-5">
                <GithubIcon className="text-current" />
              </a>
            </div>
          </div>
        </div>
      </header>

      <main className="min-h-full h-full relative">
        <Outlet />
      </main>
    </>
  );
};
