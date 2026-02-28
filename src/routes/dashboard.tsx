import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import { Activity, Calendar, FileText, Home, Pill, Settings } from "lucide-react";
import type { SidebarItems } from "@/components/app-sidebar";
import type { RoutePath } from "@/types/routes";
import { SidebarInset, SidebarProvider } from "@/components/animate-ui/components/radix/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { getJwt, getSession } from "@/lib/auth-session";
import { setAuthToken } from "@/lib/client-auth-config";
import { UserMenu } from "@/components/user-menu";
import type { User } from "@/types/auth";

export const Route = createFileRoute("/dashboard")({
  beforeLoad: async () => {
    const session = await getSession();

    if (!session) {
      throw redirect({ to: "/auth" });
    }

    if (session.user.role === "admin") {
      throw redirect({ to: "/admin/dashboard" });
    }

    const jwt = await getJwt();

    if (jwt) {
      setAuthToken(jwt);
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

function DashboardLayout() {
  const { user } = Route.useRouteContext() satisfies { user: User };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full">
        <AppSidebar
          renderTrigger={true}
          baseUrl="/dashboard"
          items={sidebarItems}
          footer={<UserMenu user={user} />}
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
