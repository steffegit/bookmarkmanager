import { createFileRoute, Link } from "@tanstack/react-router";
import { Settings } from "lucide-react";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8">
      <div className="w-10 h-10 rounded-sm bg-foreground/[0.04] border border-border flex items-center justify-center">
        <Settings className="w-4 h-4 text-muted-foreground" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-foreground">Settings</p>
        <p className="text-xs text-muted-foreground font-mono mt-1">
          App preferences and configuration — coming soon.
        </p>
      </div>
      <Link
        to="/"
        className="text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors font-mono"
      >
        ← Back to bookmarks
      </Link>
    </div>
  );
}
