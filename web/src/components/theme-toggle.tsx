import React from "react";
import { Button } from "./ui/button";
import { MoonIcon, SunIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const DARK_CLASS = "dark";

interface ThemeToggle {
  className?: string;
}

export const ThemeToggle = React.forwardRef<
  HTMLButtonElement,
  Omit<React.ComponentProps<"button">, "onClick" | "children">
>(({ className, ...props }, ref) => {
  const [isDark, setIsDark] = React.useState<boolean>(!!document.documentElement.classList.contains(DARK_CLASS));

  const toggle = React.useCallback(() => {
    setIsDark((t) => {
      const toggled = !t;

      const classList = document.documentElement.classList;

      if (toggled) {
        if (!classList.contains(DARK_CLASS)) {
          classList.add(DARK_CLASS);
        }
      } else {
        if (classList.contains(DARK_CLASS)) {
          classList.remove(DARK_CLASS);
        }
      }

      return toggled;
    });
  }, []);

  return (
    <Button ref={ref} variant="ghost" size="icon" className={cn(className)} onClick={toggle} {...props}>
      {isDark ? <MoonIcon /> : <SunIcon />}
    </Button>
  );
});

ThemeToggle.displayName = "ThemeToggle";
