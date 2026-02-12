import * as React from "react";

import { cn } from "@/lib/utils";

function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm",
        "transition-all duration-300 ease-out",
        "hover:shadow-lg hover:shadow-primary/5 dark:hover:shadow-primary/10",
        "dark:bg-slate-800/50 dark:border-slate-700/50",
        className,
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className,
      )}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-none font-semibold tracking-tight text-foreground", className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm leading-relaxed", className)}
      {...props}
    />
  );
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn("col-start-2 row-span-2 row-start-1 self-start justify-self-end", className)}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-content" className={cn("px-6", className)} {...props} />;
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
      {...props}
    />
  );
}

// New variant for feature cards with icon containers
function CardIcon({
  className,
  color = "blue",
  ...props
}: React.ComponentProps<"div"> & {
  color?: "blue" | "green" | "purple" | "orange" | "red" | "teal";
}) {
  const colorVariants = {
    blue: "bg-blue-100 dark:bg-blue-900/20 text-blue-600",
    green: "bg-green-100 dark:bg-green-900/20 text-green-600",
    purple: "bg-purple-100 dark:bg-purple-900/20 text-purple-600",
    orange: "bg-orange-100 dark:bg-orange-900/20 text-orange-600",
    red: "bg-red-100 dark:bg-red-900/20 text-red-600",
    teal: "bg-teal-100 dark:bg-teal-900/20 text-teal-600",
  };

  return (
    <div
      data-slot="card-icon"
      className={cn(
        "p-3 rounded-lg w-fit transition-transform duration-300 group-hover:scale-110",
        colorVariants[color],
        className,
      )}
      {...props}
    />
  );
}

// Interactive card variant with scale effect
function CardInteractive({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-interactive"
      className={cn(
        "group bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6",
        "shadow-md hover:shadow-lg dark:hover:shadow-blue-500/10",
        "transition-all duration-300 ease-out",
        "hover:scale-[1.02]",
        "border-0 dark:bg-slate-800 dark:border-slate-700",
        className,
      )}
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
  CardIcon,
  CardInteractive,
};
