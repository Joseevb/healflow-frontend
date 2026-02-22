import { Link, Outlet, createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import {
  Activity,
  Calendar,
  FileText,
  Home,
  LogOut,
  Moon,
  Pill,
  Settings,
  Sun,
  User,
} from "lucide-react";
import type { SidebarItems } from "@/components/app-sidebar";
import type { RoutePath } from "@/types/routes";
import { SidebarInset, SidebarProvider } from "@/components/animate-ui/components/radix/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { signOut } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/components/providers/theme-provider";
import { getSession } from "@/lib/auth-session";

/**
 * Generate user initials from name
 * Handles single names, multiple names, and undefined values safely
 */
function getInitials(name: string | null | undefined): string {
  if (!name || typeof name !== "string") return "U";

  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();

  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export const Route = createFileRoute("/dashboard")({
  beforeLoad: async () => {
    const session = await getSession();

    if (!session) {
      throw redirect({ to: "/auth" });
    }

    return {
      hideHeader: true,
      user: session.user,
    };
  },
  component: DashboardLayout,
});

const sidebarItems = (_baseUrl: RoutePath): SidebarItems => [
  {
    title: "Dashboard",
    icon: Home,
    url: "/dashboard",
  },
  {
    title: "Appointments",
    icon: Calendar,
    url: "/dashboard/appointments",
  },
  {
    title: "Medications",
    icon: Pill,
    url: "/dashboard/medications",
  },
  {
    title: "Health Metrics",
    icon: Activity,
    url: "/dashboard/health-metrics",
  },
  {
    title: "Medical Records",
    icon: FileText,
    url: "/dashboard" as RoutePath,
  },
  {
    title: "Settings",
    icon: Settings,
    url: "/dashboard/settings",
  },
];

function UserMenu() {
  const navigate = useNavigate();
  const { user } = Route.useRouteContext();
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 px-3 py-6 hover:bg-sidebar-accent"
        >
          <div className="flex size-8 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 text-sm font-medium">
            {getInitials(user.name)}
          </div>
          <div className="flex flex-col items-start text-sm">
            <span className="font-medium">{user.name}</span>
            <span className="text-xs text-muted-foreground">{user.email}</span>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/dashboard/settings">
            <User className="size-4 mr-2" />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/dashboard/settings">
            <Settings className="size-4 mr-2" />
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={(e) => setTheme(theme === "light" ? "dark" : "light", e)}>
          {theme === "light" ? <Moon className="size-4 mr-2" /> : <Sun className="size-4 mr-2" />}
          {theme === "light" ? "Dark mode" : "Light mode"}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={async () => {
            await signOut();
            await navigate({ to: "/" });
          }}
        >
          <LogOut className="size-4 mr-2" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function DashboardLayout() {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full">
        <AppSidebar
          renderTrigger={true}
          baseUrl="/dashboard"
          items={sidebarItems}
          footer={<UserMenu />}
        />
        <SidebarInset className="bg-slate-50 dark:bg-slate-900">
          <div className="container mx-auto px-4 py-8 max-w-7xl">
            <Outlet />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
