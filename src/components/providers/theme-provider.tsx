import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme, event?: React.MouseEvent) => void;
};

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, _setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") {
      return defaultTheme;
    }
    return (localStorage.getItem(storageKey) as Theme | undefined) || defaultTheme;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
      root.classList.add(systemTheme);
      return;
    }
    root.classList.add(theme);
  }, [theme]);

  const value = {
    theme,
    setTheme: (t: Theme, event?: React.MouseEvent) => {
      if (!event) {
        localStorage.setItem(storageKey, t);
        _setTheme(t);
        return;
      }

      const x = event.clientX;
      const y = event.clientY;

      document.documentElement.style.setProperty("--circle-x", `${x}px`);
      document.documentElement.style.setProperty("--circle-y", `${y}px`);

      document.documentElement.classList.add("theme-transitioning");

      const transition = document.startViewTransition(() => {
        localStorage.setItem(storageKey, t);
        _setTheme(t);
      });

      transition.finished.finally(() => {
        document.documentElement.classList.remove("theme-transitioning");
      });
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context: ThemeProviderState | undefined = useContext(ThemeProviderContext);

  return context;
};
