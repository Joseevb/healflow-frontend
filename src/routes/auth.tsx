import { Link, Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { getSession } from "@/lib/auth-session";

export const Route = createFileRoute("/auth")({
  component: RouteComponent,
  context: ({ context }) => ({ ...context, hideHeader: true }),

  beforeLoad: async () => {
    const session = await getSession();
    return {
      session,
    };
  },
  loader: ({ context }) => {
    const session = context.session;

    if (session && !location.pathname.startsWith("/auth/sign-up")) {
      throw redirect({ to: "/dashboard" });
    }
  },
});

export default function RouteComponent() {
  return (
    <div className="relative min-h-screen w-full isolate">
      <div className="fixed inset-0 -z-10">
        <Image
          src="https://plus.unsplash.com/premium_photo-1681843042287-4240248634b5?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="background"
          className="h-full w-full object-cover"
          layout="fullWidth"
          priority={true}
        />
        <div className="absolute inset-0 bg-secondary/25 backdrop-filter dark:bg-background/75 backdrop-blur-md" />
      </div>

      <div className="absolute top-8 left-8 z-20 flex items-center gap-4">
        <Button asChild variant="outline">
          <Link to="/">← Home</Link>
        </Button>
        <ModeToggle />
      </div>

      <div className="flex min-h-screen flex-col items-center justify-center py-10 gap-8 relative z-10">
        <Image src="/logo-full.png" alt="logo" width={420} height={420} />
        <Outlet />
      </div>
    </div>
  );
}
