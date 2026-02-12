import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const tabsListVariants = cva("inline-flex items-center justify-center gap-1 p-1", {
  variants: {
    variant: {
      default:
        "bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/50",
      pills: "bg-transparent gap-2",
      underline:
        "bg-transparent border-b border-slate-200 dark:border-slate-700 rounded-none gap-0 p-0",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

const tabsTriggerVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*="size-"])]:size-4',
  {
    variants: {
      variant: {
        default: [
          "rounded-lg px-4 py-2.5",
          "text-slate-600 dark:text-slate-400",
          "hover:text-slate-900 dark:hover:text-slate-200",
          "data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700",
          "data-[state=active]:text-slate-900 dark:data-[state=active]:text-white",
          "data-[state=active]:shadow-sm",
        ],
        pills: [
          "rounded-full px-5 py-2",
          "text-slate-600 dark:text-slate-400",
          "hover:bg-slate-100 dark:hover:bg-slate-800",
          "hover:text-slate-900 dark:hover:text-slate-200",
          "data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-blue-700",
          "dark:data-[state=active]:from-blue-500 dark:data-[state=active]:to-blue-600",
          "data-[state=active]:text-white data-[state=active]:shadow-md",
          "data-[state=active]:hover:from-blue-700 data-[state=active]:hover:to-blue-800",
        ],
        underline: [
          "px-4 py-3 rounded-none border-b-2 border-transparent -mb-px",
          "text-slate-600 dark:text-slate-400",
          "hover:text-slate-900 dark:hover:text-slate-200",
          "hover:border-slate-300 dark:hover:border-slate-600",
          "data-[state=active]:border-blue-600 dark:data-[state=active]:border-blue-500",
          "data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400",
        ],
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

type TabsContextValue = {
  variant: "default" | "pills" | "underline";
};

const TabsContext = React.createContext<TabsContextValue>({
  variant: "default",
});

function Tabs({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-3", className)}
      {...props}
    />
  );
}

function TabsList({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> & VariantProps<typeof tabsListVariants>) {
  return (
    <TabsContext.Provider value={{ variant: variant || "default" }}>
      <TabsPrimitive.List
        data-slot="tabs-list"
        className={cn(tabsListVariants({ variant }), className)}
        {...props}
      />
    </TabsContext.Provider>
  );
}

function TabsTrigger({
  className,
  variant: variantProp,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger> & VariantProps<typeof tabsTriggerVariants>) {
  const { variant: contextVariant } = React.useContext(TabsContext);
  const variant = variantProp || contextVariant;

  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(tabsTriggerVariants({ variant }), className)}
      {...props}
    />
  );
}

function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn(
        "flex-1 outline-none",
        "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "animate-in fade-in-0 slide-in-from-bottom-1 duration-200",
        className,
      )}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants, tabsTriggerVariants };
