import { useForm } from "@tanstack/react-form";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/profile/change-password")({
  component: ChangePasswordRoute,
});

const schema = z
  .object({
    oldPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New passwords must match",
    path: ["confirmPassword"],
  });

function ChangePasswordRoute() {
  const { user, isAuthenticated, changePassword } = useAuth();
  const navigate = useNavigate();
  const [formError, setFormError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { Field, handleSubmit } = useForm({
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    validators: {
      onBlur: schema,
    },
    onSubmit: async ({ value }) => {
      setFormError(null);
      setIsLoading(true);

      try {
        await changePassword(value.oldPassword, value.newPassword);
        toast.success("Password changed successfully.");
        navigate({ to: "/profile" });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Password change failed";
        setFormError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
  });

  if (!isAuthenticated || !user) {
    navigate({ to: "/login" });
    return null;
  }

  return (
    <div className="flex-1 flex items-center justify-center relative overflow-hidden px-4 py-16">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 30%, oklch(0.637 0.185 259 / 0.05) 0%, transparent 60%)`,
        }}
      />

      <div className="relative w-full max-w-sm">
        <div className="mb-8">
          <Link
            to="/profile"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-3 h-3" />
            Back to profile
          </Link>
          <h1 className="text-2xl text-foreground tracking-tight">
            Change password
          </h1>
          <p className="text-xs text-muted-foreground mt-1 font-mono">
            Update your account password
          </p>
        </div>

        <div className="rounded-sm border border-border bg-card p-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleSubmit();
            }}
            className="flex flex-col gap-5"
          >
            <Field name="oldPassword">
              {({ state, handleChange, handleBlur }) => (
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">
                    Current password
                  </Label>
                  <PasswordInput
                    value={state.value}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleChange(e.target.value)
                    }
                    onBlur={handleBlur}
                    placeholder="••••••••"
                    className="h-8 text-xs font-mono"
                    required
                  />
                  {!state.meta.isValid && (
                    <Alert variant="destructive" className="rounded-sm p-2">
                      <AlertDescription className="text-xs">
                        {typeof state.meta.errors[0] === "string"
                          ? state.meta.errors[0]
                          : state.meta.errors[0]?.message}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </Field>

            <div className="w-full h-px bg-border/60" />

            <Field
              name="newPassword"
              validators={{
                onChangeListenTo: ["confirmPassword"],
                onChange: ({ value }) =>
                  value.length < 8
                    ? "New password must be at least 8 characters"
                    : undefined,
              }}
            >
              {({ state, handleChange, handleBlur }) => (
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">
                    New password
                  </Label>
                  <PasswordInput
                    value={state.value}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleChange(e.target.value)
                    }
                    onBlur={handleBlur}
                    placeholder="••••••••"
                    className="h-8 text-xs font-mono"
                    required
                  />
                  {!state.meta.isValid && (
                    <Alert variant="destructive" className="rounded-sm p-2">
                      <AlertDescription className="text-xs">
                        {typeof state.meta.errors[0] === "string"
                          ? state.meta.errors[0]
                          : state.meta.errors[0]?.message}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </Field>

            <Field
              name="confirmPassword"
              validators={{
                onChangeListenTo: ["newPassword"],
                onChange: ({ value, fieldApi }) => {
                  if (value !== fieldApi.form.getFieldValue("newPassword")) {
                    return "New passwords must match";
                  }
                  return undefined;
                },
              }}
            >
              {({ state, handleChange, handleBlur }) => (
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">
                    Confirm new password
                  </Label>
                  <PasswordInput
                    value={state.value}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleChange(e.target.value)
                    }
                    onBlur={handleBlur}
                    placeholder="••••••••"
                    className="h-8 text-xs font-mono"
                    required
                  />
                  {!state.meta.isValid && (
                    <Alert variant="destructive" className="rounded-sm p-2">
                      <AlertDescription className="text-xs">
                        {typeof state.meta.errors[0] === "string"
                          ? state.meta.errors[0]
                          : state.meta.errors[0]?.message}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </Field>

            {formError && (
              <div className="flex items-center gap-2 p-2.5 text-xs text-destructive bg-destructive/[0.08] border border-destructive/20 rounded-sm font-mono">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {formError}
              </div>
            )}

            <div className="flex gap-2 mt-1">
              <Link to="/profile" className="flex-1">
                <button
                  type="button"
                  className="h-8 w-full flex items-center justify-center text-xs font-medium text-muted-foreground border border-border rounded-sm hover:text-foreground hover:border-border/80 hover:bg-foreground/[0.04] transition-all"
                >
                  Cancel
                </button>
              </Link>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 h-8 flex items-center justify-center text-xs font-medium bg-primary text-primary-foreground rounded-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Updating..." : "Update password"}
              </button>
            </div>
          </form>
        </div>

        <p className="mt-4 text-xs font-mono text-muted-foreground/40 px-0.5">
          Use at least 8 characters with a mix of letters, numbers, and symbols.
        </p>
      </div>
    </div>
  );
}
