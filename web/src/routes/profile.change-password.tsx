import { useForm } from "@tanstack/react-form";
import {
  createFileRoute,
  Link,
  redirect,
  useNavigate,
} from "@tanstack/react-router";
import { AlertCircle, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
        toast.success("Password changed successfully!");
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
    redirect({ to: "/login" });
    return null;
  }

  return (
    <div className="flex items-center justify-center flex-1 p-4 text-foreground">
      <div className="max-w-md w-full flex flex-col gap-6">
        {/* Header */}
        <div className="text-center flex flex-col gap-4">
          <h1 className="text-2xl font-bold">Change Password</h1>
          <p className="text-muted-foreground">
            Update your account password to keep your account secure
          </p>
        </div>

        {/* Form */}
        <Card className="p-6 border border-accent-foreground/10 rounded-lg">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleSubmit();
            }}
            className="flex flex-col gap-6"
          >
            <Field name="oldPassword">
              {({ state, handleChange, handleBlur }) => (
                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-medium">
                    Current Password
                  </Label>
                  <div className="relative">
                    <Input
                      type={showOldPassword ? "text" : "password"}
                      value={state.value}
                      onChange={(e) => handleChange(e.target.value)}
                      onBlur={handleBlur}
                      placeholder="Enter your current password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowOldPassword(!showOldPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showOldPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {!state.meta.isValid && (
                    <Alert variant="destructive" className="rounded-md p-2">
                      <AlertDescription>
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
                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-medium">New Password</Label>
                  <div className="relative">
                    <Input
                      type={showNewPassword ? "text" : "password"}
                      value={state.value}
                      onChange={(e) => handleChange(e.target.value)}
                      onBlur={handleBlur}
                      placeholder="Enter your new password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showNewPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {!state.meta.isValid && (
                    <Alert variant="destructive" className="rounded-md p-2">
                      <AlertDescription>
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
                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-medium">
                    Confirm New Password
                  </Label>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      value={state.value}
                      onChange={(e) => handleChange(e.target.value)}
                      onBlur={handleBlur}
                      placeholder="Confirm your new password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {!state.meta.isValid && (
                    <Alert variant="destructive" className="rounded-md p-2">
                      <AlertDescription>
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
              <div className="flex items-center gap-2 p-3 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-md">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div className="flex gap-3">
              <Link to="/profile" className="flex-1">
                <Button type="button" variant="outline" className="w-full">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </Link>
              <Button type="submit" className="flex-1" disabled={isLoading}>
                {isLoading ? "Changing..." : "Change Password"}
              </Button>
            </div>
          </form>
        </Card>

        {/* Security Tips */}
        <Card className="p-4 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="text-sm flex flex-col gap-2">
            <p className="font-medium text-blue-900 dark:text-blue-100">
              Password Security Tips:
            </p>
            <ul className="text-blue-700 dark:text-blue-300 flex flex-col gap-1 list-disc list-inside text-xs">
              <li>Use at least 8 characters</li>
              <li>Include uppercase, lowercase, numbers, and symbols</li>
              <li>Avoid common words or personal information</li>
              <li>Don't reuse passwords from other accounts</li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
}
