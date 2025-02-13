import React from "react";

const DARK_CLASS = "dark";

export type Theme = "light" | "dark";

export interface ThemeContextProps {
  theme: Theme;
  toggle(theme?: Theme): void;
  ifTheme: <T>(light: T, dark: T) => T;
}

export const ThemeContext = React.createContext<ThemeContextProps | null>(null);

export interface ThemeProviderProps {
  children: React.ReactNode;
}

function getElementTheme(element: HTMLElement): Theme {
  return element.classList.contains(DARK_CLASS) ? "dark" : "light";
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = React.useState<Theme>(getElementTheme(document.documentElement));

  const toggle = React.useCallback((theme?: Theme) => {
    const classList = document.documentElement.classList;

    const setDark = theme ? theme === "dark" : !classList.contains(DARK_CLASS);
    if (setDark) {
      if (!classList.contains(DARK_CLASS)) {
        classList.add(DARK_CLASS);
      }
    } else {
      if (classList.contains(DARK_CLASS)) {
        classList.remove(DARK_CLASS);
      }
    }
  }, []);

  const ifTheme = React.useCallback(
    function <T>(light: T, dark: T) {
      if (theme === "dark") return dark;
      return light;
    },
    [theme]
  );

  React.useEffect(() => {
    const target = document.documentElement;

    const observer = new MutationObserver((mutationsList) => {
      for (const mutation of mutationsList) {
        if (mutation.type === "attributes" && mutation.attributeName === "class") {
          const theme = getElementTheme(target);
          setTheme(theme);
          localStorage.setItem("@lilbunnyrabbit/theme", theme);
          localStorage.setItem("tsd-theme", theme);
        }
      }
    });

    observer.observe(target, { attributes: true, attributeFilter: ["class"] });

    return () => {
      observer.disconnect();
    };
  }, []);

  return <ThemeContext.Provider value={{ theme, toggle, ifTheme }} children={children} />;
};

export const useTheme = () => {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error(`${useTheme.name} must be used within ${ThemeProvider.name}`);
  }

  return context;
};
