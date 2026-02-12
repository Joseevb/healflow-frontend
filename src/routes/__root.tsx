import "@/lib/client-auth-config";
import {
  HeadContent,
  Link,
  Scripts,
  createRootRouteWithContext,
  useLocation,
  useMatches,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TanStackDevtools } from "@tanstack/react-devtools";

import TanStackQueryDevtools from "../integrations/tanstack-query/devtools";

import appCss from "../styles.css?url";
import type { ErrorComponentProps } from "@tanstack/react-router";

import type { QueryClient } from "@tanstack/react-query";
import Header from "@/components/header";
import { syncUsers } from "@/server/auth";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  const location = useLocation();
  return <div>Page not found at {location.pathname}</div>;
}

function ErrorComponent({ info }: ErrorComponentProps) {
  const location = useLocation();
  return (
    <AlertDialog open>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Something went wrong</AlertDialogTitle>
          <AlertDialogDescription>{info?.componentStack}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction asChild>
            <Link to={location.pathname}>Try again</Link>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export interface RouterContext {
  queryClient: QueryClient;
  hideHeader: boolean;
}

// Flag to ensure sync only runs once per server start
let hasSyncedUsers = false;

export const Route = createRootRouteWithContext<RouterContext>()({
  beforeLoad: async () => {
    // Only sync on server-side and only once per server start
    if (typeof window === "undefined" && !hasSyncedUsers) {
      hasSyncedUsers = true;
      try {
        const result = await syncUsers();
        console.log(
          `[App] User sync complete: validated ${result.validated}, deleted ${result.deleted}`,
        );
      } catch (error) {
        console.error("[App] User sync failed:", error);
      }
    }
  },
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "Healflow - Modern Hospital Management",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
    scripts: [
      {
        children: `
          (function() {
            var storageKey = 'vite-ui-theme';
            var defaultTheme = 'system';

            try {
              var theme = localStorage.getItem(storageKey) || defaultTheme;
              var systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

              var root = document.documentElement;
              root.classList.remove('light', 'dark');

              if (theme === 'system') {
                root.classList.add(systemTheme);
              } else {
                root.classList.add(theme);
              }
            } catch (e) {}
          })();
        `,
      },
    ],
  }),

  shellComponent: RootDocument,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  const matches = useMatches();

  const hideHeader = matches.some((match) => match.context.hideHeader);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        {!hideHeader && (
          <header>
            <Header />
          </header>
        )}
        {children}
        <TanStackDevtools
          config={{
            position: "bottom-right",
          }}
          plugins={[
            {
              name: "Tanstack Router",
              render: <TanStackRouterDevtoolsPanel />,
            },
            TanStackQueryDevtools,
          ]}
        />
        <Scripts />
        <Toaster richColors={true} />
      </body>
    </html>
  );
}
