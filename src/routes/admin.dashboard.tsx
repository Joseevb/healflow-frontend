import { SidebarInset, SidebarProvider } from "@/components/animate-ui/components/radix/sidebar";
import { AppSidebar, SidebarItems } from "@/components/app-sidebar";
import { UserMenu } from "@/components/user-menu";
import { getJwt, getSession } from "@/lib/auth-session";
import { setAuthToken } from "@/lib/client-auth-config";
import { User } from "@/types/auth";
import { RoutePath } from "@/types/routes";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { Home } from "lucide-react";

export const Route = createFileRoute("/admin/dashboard")({
  component: RouteComponent,
  beforeLoad: async () => {
    const session = await getSession();

    if (!session) {
      throw redirect({ to: "/auth" });
    }

    if (session.user.role !== "admin") {
      throw redirect({ to: "/unauthorized" });
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
});

function SideBar({ children }: { children: React.ReactNode }) {
  const { user } = Route.useRouteContext() satisfies { user: User };

  const sidebarItems = (_baseUrl: RoutePath): SidebarItems => [
    {
      title: "Dashboard",
      icon: Home,
      url: "/admin/dashboard",
    },
  ];

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
          <div className="container mx-auto px-4 py-8 max-w-7xl">{children}</div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

function RouteComponent() {
  return (
    <SideBar>
      <div>Hello</div>
    </SideBar>
  );
}
