import { Moon, Sun } from "lucide-react";

import type { VariantProps } from "class-variance-authority";
import type { buttonVariants } from "@/components/ui/button";
import { useTheme } from "@/components/providers/theme-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ModeToggle({
  type = "default",
  variant = "outline",
}: {
  type?: "default" | "large";
  variant?: VariantProps<typeof buttonVariants>["variant"];
}) {
  const { setTheme, theme: currentTheme } = useTheme();

  const handleThemeChange = (theme: "light" | "dark" | "system") => (e: React.MouseEvent) =>
    setTheme(theme, e);

  const isLarge = type === "large";

  return (
    <Button
      variant={variant}
      size={isLarge ? "default" : "icon"}
      className={cn(isLarge && "gap-2")}
      onClick={handleThemeChange(currentTheme === "light" ? "dark" : "light")}
    >
      <div className="relative flex h-[1.2rem] w-[1.2rem] shrink-0 items-center justify-center">
        <Sun className="absolute rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      </div>
      <span className={cn(!isLarge && "sr-only")}>Toggle theme</span>
    </Button>
  );
}
