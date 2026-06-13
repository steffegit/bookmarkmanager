import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { ThemeProvider } from "@/components/theme-provider.tsx";
import { Toaster } from "@/components/ui/sonner.tsx";
import Header from "../components/Header";
import TanStackQueryLayout from "../integrations/tanstack-query/layout.tsx";

interface MyRouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: () => (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="flex flex-col min-h-screen">
        <Header />

        <Outlet />

        <TanStackRouterDevtools />

        <TanStackQueryLayout />
        <Toaster className="z-50 rounded-md" />
      </div>
    </ThemeProvider>
  ),
  notFoundComponent: () => (
    <div className="flex flex-col items-center justify-center gap-4 flex-1 p-8">
      <div className="font-display text-8xl font-bold text-foreground/10 select-none">
        404
      </div>
      <div className="text-center">
        <p className="text-sm text-muted-foreground font-mono">
          Page not found.
        </p>
      </div>
    </div>
  ),
});
