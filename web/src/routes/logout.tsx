import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/logout")({
  component: LogoutRoute,
});

function LogoutRoute() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const performLogout = async () => {
      try {
        await logout();
        navigate({ to: "/login" });
      } catch (error) {
        console.error("Logout failed:", error);
        navigate({ to: "/login" });
      }
    };

    performLogout();
  }, [logout, navigate]);

  return (
    <div className="flex-1 flex items-center justify-center px-4">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 bg-primary/10 border border-primary/20 rounded-sm flex items-center justify-center">
          <div className="w-3 h-3 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
        <p className="text-xs font-mono text-muted-foreground">
          Signing out...
        </p>
      </div>
    </div>
  );
}
