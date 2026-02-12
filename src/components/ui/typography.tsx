import React from "react";
import { cn } from "@/lib/utils";

function H1({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h1
      className={cn(
        "scroll-m-20 text-center text-4xl font-extrabold tracking-tight text-balance",
        className,
      )}
    >
      {children}
    </h1>
  );
}

function H2({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h2
      className={cn(
        "scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0",
        className,
      )}
    >
      {children}
    </h2>
  );
}

function H3({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h3 className={cn("scroll-m-20 text-2xl font-semibold tracking-tight", className)}>
      {children}
    </h3>
  );
}

function H4({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h4 className={cn("scroll-m-20 text-xl font-semibold tracking-tight", className)}>
      {children}
    </h4>
  );
}

function Paragraph({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn("leading-7 not-first:mt-6", className)}>{children}</p>;
}

function Blockquote({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <blockquote className={cn("mt-6 border-l-2 pl-6 italic", className)}>{children}</blockquote>
  );
}

type ListProps = {
  ordered?: boolean;
  items: React.ReactNode;
  className?: string;
  itemClassName?: string;
};

function List({ ordered, items, className = "", itemClassName = "" }: ListProps) {
  const ListTag = ordered ? "ol" : "ul";

  return (
    <ListTag
      className={cn("my-6 ml-6", ordered ? "list-decimal" : "list-disc", "[&>li]:mt-2", className)}
    >
      {React.Children.map(items, (item, index) => {
        if (!React.isValidElement(item)) {
          return (
            <li key={index} className={itemClassName}>
              {item}
            </li>
          );
        }

        return (
          <li key={item.key ?? index} className={itemClassName}>
            {item}
          </li>
        );
      })}
    </ListTag>
  );
}

function InlineCode({ children }: { children: React.ReactNode }) {
  return (
    <code className="bg-muted relative rounded px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">
      {children}
    </code>
  );
}

export { H1, H2, H3, H4, Paragraph, Blockquote, List, InlineCode };
