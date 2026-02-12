import { Image } from "@unpic/react";
import React from "react";
import { Link } from "@tanstack/react-router";
import type { buttonVariants } from "@/components/ui/button";
import type { VariantProps } from "class-variance-authority";
import type { JSX } from "react";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

export type NavItemBase = {
  name: string;
  icon?: React.ReactNode;
  className?: string;
};

export type NavItemLink = NavItemBase & {
  type: "link";
  href: string;
  description?: string;
  buttonVariant?: VariantProps<typeof buttonVariants>["variant"];
};

export type NavItemDropdown = NavItemBase & {
  type: "dropdown";
  children: Array<NavItemLink | NavItemHighlight>;
  buttonVariant?: VariantProps<typeof buttonVariants>["variant"];
};

export type NavItemHighlight = NavItemBase & {
  type: "highlight";
  href: string;
  description: string;
  subtitle?: string;
};

export type NavItemCustomComponent = NavItemBase & {
  type: "custom";
  component: React.ReactNode;
};

export type NavItem = NavItemLink | NavItemDropdown | NavItemHighlight | NavItemCustomComponent;

function DropdownContentItem({ item }: { item: NavItemLink | NavItemHighlight }) {
  const contentItemRenderMap: Record<string, () => JSX.Element> = {
    highlight: () => (
      <li className="row-span-3">
        <NavigationMenuLink asChild>
          <Link
            to={item.href}
            className="from-muted/50 to-muted flex h-full w-full flex-col justify-end rounded-md bg-linear-to-b p-6 no-underline outline-none select-none focus:shadow-md hover:bg-accent/5 transition-colors"
          >
            <div className="mt-4 mb-2 text-lg font-medium">{item.name}</div>
            <p className="text-muted-foreground text-sm leading-tight">
              {(item as NavItemHighlight).description}
            </p>
          </Link>
        </NavigationMenuLink>
      </li>
    ),
    link: () => (
      <li>
        <NavigationMenuLink asChild>
          <Link
            to={item.href}
            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
          >
            <div className="text-sm font-medium leading-none flex items-center gap-2">
              {item.icon}
              {item.name}
            </div>
            {(item as NavItemLink).description && (
              <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                {(item as NavItemLink).description}
              </p>
            )}
          </Link>
        </NavigationMenuLink>
      </li>
    ),
  };

  return contentItemRenderMap[item.type]();
}

interface GenericHeaderProps {
  navItems: Array<NavItem>;
  className?: string;
}

export function DynamicNavigationHeader({ navItems, className }: GenericHeaderProps) {
  const navItemRenderMap: Record<string, (item: NavItem) => React.ReactNode> = {
    link: (item) => (
      <NavigationMenuLink asChild className={cn(navigationMenuTriggerStyle(), item.className)}>
        <Button asChild variant={(item as NavItemLink).buttonVariant ?? "outline"}>
          <Link to={(item as NavItemLink).href} className="flex flex-row items-center gap-2">
            {item.icon}
            {item.name}
          </Link>
        </Button>
      </NavigationMenuLink>
    ),
    dropdown: (item) => {
      const dropdownItem = item as NavItemDropdown;
      const hasHighlightChild = dropdownItem.children.some((child) => child.type === "highlight");

      return (
        <div className={cn(item.className)}>
          <Button asChild variant={(item as NavItemLink).buttonVariant ?? "outline"}>
            <NavigationMenuTrigger className="flex flex-row items-center gap-2">
              {item.icon}
              {item.name}
            </NavigationMenuTrigger>
          </Button>
          <NavigationMenuContent>
            <ul
              className={`grid gap-3 p-6 ${
                hasHighlightChild
                  ? "md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]"
                  : "w-[400px] gap-2 md:w-[500px] md:grid-cols-2 lg:w-[600px]"
              }`}
            >
              {dropdownItem.children.map((child) => (
                <DropdownContentItem key={child.name} item={child} />
              ))}
            </ul>
          </NavigationMenuContent>
        </div>
      );
    },
    custom: (item) => {
      return (item as NavItemCustomComponent).component;
    },
  };

  return (
    <header
      className={cn(
        "flex items-center justify-between py-4 px-8 sm:px-6 lg:px-8 backdrop-blur-sm bg-accent/10",
        className,
      )}
    >
      <div>
        <Link to={"/"}>
          <Image src={"/logo.png"} alt="logo" width={40} height={40} />
        </Link>
      </div>

      <NavigationMenu>
        <NavigationMenuList className="flex items-center">
          {navItems.map((item) => (
            <NavigationMenuItem key={item.name}>
              {navItemRenderMap[item.type](item)}
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </NavigationMenu>
    </header>
  );
}
