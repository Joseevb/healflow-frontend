import { HomeIcon, LogOutIcon, Settings, UserIcon } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { NavItem, NavItemCustomComponent } from "@/components/ui/dynamic-navigation-header";
import { DynamicNavigationHeader } from "@/components/ui/dynamic-navigation-header";
import { signOut, useSession } from "@/lib/auth-client";
import { NavigationMenuLink, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { ModeToggle } from "@/components/ui/mode-toggle";
import type { RoutePath } from "@/types/routes";

type UserMenuItemBase = {
  label: string;
  icon?: React.ReactNode;
  variant?: "default" | "destructive";
};

type UserMenuItemLink = UserMenuItemBase & {
  type: "link";
  url: RoutePath;
};

type UserMenuButton = UserMenuItemBase & {
  type: "button";
  asChild?: boolean;
  onClick: () => void;
};

type UserMenuItem = UserMenuItemLink | UserMenuButton;

const userMenuItems: Array<UserMenuItem> = [
  {
    type: "link",
    url: "/dashboard",
    label: "Dashboard",
    icon: <HomeIcon className="h-4 w-4" />,
  },
  {
    type: "link",
    url: "/dashboard/settings",
    label: "Settings",
    icon: <Settings className="h-4 w-4" />,
  },
  {
    type: "button",
    label: "Sign out",
    variant: "destructive",
    onClick: () => signOut(),
    icon: <LogOutIcon className="h-4 w-4" />,
  },
];

function getNavItems(isAuthenticated: boolean): Array<NavItem> {
  const baseNavItems: Array<NavItem> = [
    {
      type: "custom",
      name: "Dashboard",
      component: isAuthenticated && (
        <Button asChild variant={"outline"}>
          <Link to="/dashboard">Dashboard</Link>
        </Button>
      ),
    },
    {
      type: "custom",
      name: "Mode toggle",
      component: <ModeToggle />,
    },
  ];

  const authNavItem: NavItemCustomComponent = {
    type: "custom",
    name: "Auth",
    component: isAuthenticated ? (
      <div className="ml-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="default" size={"icon"}>
              <UserIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {userMenuItems.map((item) => (
              <DropdownMenuItem key={item.label} variant={item.variant ?? "default"} asChild>
                {item.type === "link" ? (
                  <Link to={item.url} className="size-full">
                    {item.icon && <span className="mr-2">{item.icon}</span>}
                    {item.label}
                  </Link>
                ) : (
                  <Button
                    variant="ghost"
                    className="size-full justify-start"
                    onClick={item.onClick}
                  >
                    {item.icon && <span className="mr-2">{item.icon}</span>}
                    {item.label}
                  </Button>
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ) : (
      <NavigationMenuLink asChild className={cn(navigationMenuTriggerStyle(), "ml-2")}>
        <Button asChild variant={"outline"}>
          <Link to="/auth" className="flex items-center flex-row gap-1">
            <UserIcon className="h-4 w-4" />
            Sign in
          </Link>
        </Button>
      </NavigationMenuLink>
    ),
  };

  return [...baseNavItems, authNavItem];
}

export default function HeaderWrapper() {
  const { data: session } = useSession();
  const isAuthenticated = session !== null;

  const applicationNavItems = getNavItems(isAuthenticated);

  return (
    <DynamicNavigationHeader
      navItems={applicationNavItems}
      className="bg-linear-to-br from-slate-100/90 via-blue-50/90 to-green-50/90 dark:from-slate-900/90 dark:via-blue-950/90 dark:to-green-950/75 fixed w-full z-50"
    />
  );
}
