import { useForm } from "@tanstack/react-form";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AlertCircle, ArrowRight } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { useAuth } from "../hooks/useAuth";

export const Route = createFileRoute("/signup")({
  component: SignupForm,
});

const schema = z
  .object({
    email: z.string().email("Email is invalid"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z
      .string()
      .min(8, "Confirm password must be at least 8 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });

function SignupForm() {
  const navigate = useNavigate();
  const [formError, setFormError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { signup, isAuthenticated } = useAuth();

  if (isAuthenticated) {
    navigate({ to: "/" });
    return null;
  }

  const { Field, handleSubmit } = useForm({
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
    validators: {
      onBlur: schema,
    },
    onSubmit: async ({ value }) => {
      setFormError(null);
      setIsLoading(true);

      try {
        await signup(value.email, value.password);
        toast.success("Account created. Welcome to bookmarkr.");
        navigate({ to: "/" });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Signup failed";
        setFormError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
  });

  return (
    <div className="flex-1 flex items-center justify-center relative overflow-hidden px-4 py-16">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 30%, oklch(0.637 0.185 259 / 0.05) 0%, transparent 60%)`,
        }}
      />

      <div className="relative w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="inline-flex w-10 h-10 bg-primary rounded-md items-center justify-center text-lg font-bold text-primary-foreground font-mono mb-4">
            B
          </div>
          <h1 className="font-display text-2xl text-foreground tracking-tight">
            Create account
          </h1>
          <p className="text-xs text-muted-foreground mt-1 font-mono">
            Start organizing your bookmarks
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
            <Field name="email">
              {({ state, handleChange, handleBlur }) => (
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">
                    Email
                  </Label>
                  <Input
                    defaultValue={state.value}
                    onChange={(e) => handleChange(e.target.value)}
                    onBlur={handleBlur}
                    placeholder="you@example.com"
                    className="h-8 text-xs font-mono"
                    required
                  />
                  {!state.meta.isValid && (
                    <Alert variant="destructive" className="rounded-sm p-2">
                      <AlertDescription className="text-xs">
                        {state.meta.errors[0]?.message}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </Field>

            <Field name="password">
              {({ state, handleChange, handleBlur }) => (
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">
                    Password
                  </Label>
                  <PasswordInput
                    defaultValue={state.value}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleChange(e.target.value)
                    }
                    onBlur={handleBlur}
                    placeholder="Min. 8 characters"
                    className="h-8 text-xs font-mono"
                    required
                  />
                  {!state.meta.isValid && (
                    <Alert variant="destructive" className="rounded-sm p-2">
                      <AlertDescription className="text-xs">
                        {state.meta.errors[0]?.message}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </Field>

            <Field name="confirmPassword">
              {({ state, handleChange, handleBlur }) => (
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">
                    Confirm password
                  </Label>
                  <PasswordInput
                    defaultValue={state.value}
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
                        {state.meta.errors[0]?.message}
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

            <button
              type="submit"
              disabled={isLoading}
              className="h-8 w-full flex items-center justify-center text-xs font-medium bg-primary text-primary-foreground rounded-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-1"
            >
              {isLoading ? "Creating account..." : "Create account"}
            </button>
          </form>
        </div>

        <div className="mt-4 flex items-center justify-between text-xs font-mono px-0.5">
          <span className="text-muted-foreground/50">Already have one?</span>
          <Link
            to="/login"
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            Sign in <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
