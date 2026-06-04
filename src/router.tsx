import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    // Preload route chunks/data on hover & touch so clicks feel instant.
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,
    // Render the destination immediately instead of holding on the old page.
    defaultPendingMs: 0,
  });

  return router;
};
