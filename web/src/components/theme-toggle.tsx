import { cn } from "@/lib/utils";
import { MoonStarIcon, SunIcon } from "lucide-react";
import React from "react";

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
    <button
      ref={ref}
      className={cn("[&_svg]:size-6 block w-fit h-fit text-primary", className)}
      onClick={toggle}
      {...props}
    >
      {isDark ? <MoonStarIcon /> : <SunIcon />}
    </button>
  );
});

ThemeToggle.displayName = "ThemeToggle";
