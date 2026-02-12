import { createRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import { routeTree } from "./routeTree.gen";
import * as TanstackQuery from "@/integrations/tanstack-query/root-provider";

import { ThemeProvider } from "@/components/providers/theme-provider";

// Create a new router instance
export const getRouter = () => {
  const rqContext = TanstackQuery.getContext();

  const router = createRouter({
    routeTree,
    context: { ...rqContext, hideHeader: false },
    defaultPreload: "intent",
    defaultViewTransition: true,
    Wrap: (props: { children: React.ReactNode }) => {
      return (
        <TanstackQuery.Provider {...rqContext}>
          <ThemeProvider>{props.children}</ThemeProvider>
        </TanstackQuery.Provider>
      );
    },
  });

  setupRouterSsrQueryIntegration({ router, queryClient: rqContext.queryClient });

  return router;
};
