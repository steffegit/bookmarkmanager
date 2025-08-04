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
    <div
      className="flex flex-col items-center justify-center gap-6 flex-1
      bg-gradient-to-b from-background via-background to-secondary p-8"
    >
      <div className="text-9xl font-extralight">404</div>
      <div className="max-w-lg text-center tracking-tighter font-medium">
        <p>We couldn't find the page you were looking for.</p>
        <p>If you think this is an error, you can let us know.</p>
      </div>
    </div>
  ),
});
