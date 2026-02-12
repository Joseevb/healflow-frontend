import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md hover:from-blue-700 hover:to-blue-800 hover:shadow-lg dark:from-blue-500 dark:to-blue-600 dark:hover:from-blue-600 dark:hover:to-blue-700",
        destructive:
          "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md hover:from-red-600 hover:to-red-700 hover:shadow-lg focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:from-red-600 dark:to-red-700",
        outline:
          "border-2 border-blue-200 bg-white/80 backdrop-blur-sm shadow-sm hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 dark:hover:border-slate-600 dark:text-slate-200",
        secondary:
          "bg-gradient-to-r from-slate-100 to-slate-200 text-slate-800 shadow-sm hover:from-slate-200 hover:to-slate-300 dark:from-slate-700 dark:to-slate-800 dark:text-slate-200 dark:hover:from-slate-600 dark:hover:to-slate-700",
        ghost:
          "hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-slate-800 dark:hover:text-blue-400",
        link: "text-blue-600 underline-offset-4 hover:underline dark:text-blue-400",
        gradient:
          "bg-gradient-to-r from-blue-600 via-blue-500 to-green-500 text-white shadow-md hover:from-blue-700 hover:via-blue-600 hover:to-green-600 hover:shadow-lg hover:shadow-blue-500/25",
        success:
          "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md hover:from-green-600 hover:to-green-700 hover:shadow-lg dark:from-green-600 dark:to-green-700",
      },
      size: {
        default: "h-10 px-5 py-2.5 has-[>svg]:px-4",
        sm: "h-9 rounded-lg gap-1.5 px-4 has-[>svg]:px-3 text-xs",
        lg: "h-12 rounded-xl px-8 has-[>svg]:px-6 text-base",
        xl: "h-14 rounded-xl px-10 has-[>svg]:px-8 text-lg",
        icon: "size-10 rounded-lg",
        "icon-sm": "size-9 rounded-lg",
        "icon-lg": "size-12 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
