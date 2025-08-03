import { useForm } from "@tanstack/react-form";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AlertCircle, ArrowRight } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { useAuth } from "../hooks/useAuth";
import logo from "../logo.svg";

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
				await signup(value.email, value.password, value.confirmPassword);
				toast.success("Signup successful!");
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
		<div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-background to-secondary p-4 text-foreground">
			<div className="p-8 rounded-md backdrop-blur-md bg-background border-1 border-foreground/10 flex flex-col gap-4 w-sm">
				<div className="flex justify-center">
					<img src={logo} alt="logo" className="w-32 h-32" />
				</div>

				<form
					onSubmit={(e) => {
						e.preventDefault();
						e.stopPropagation();
						handleSubmit();
					}}
					className="space-y-6"
				>
					<Field name="email">
						{({ state, handleChange, handleBlur }) => (
							<div className="flex flex-col gap-2">
								<Label className="text-lg font-medium">Email</Label>
								<Input
									defaultValue={state.value}
									onChange={(e) => handleChange(e.target.value)}
									onBlur={handleBlur}
									placeholder="Enter your email"
									required
								/>
								{!state.meta.isValid && (
									<Alert variant="destructive" className="rounded-md p-2">
										<AlertDescription>
											{state.meta.errors[0]?.message}
										</AlertDescription>
									</Alert>
								)}
							</div>
						)}
					</Field>

					<Field name="password">
						{({ state, handleChange, handleBlur }) => (
							<div className="flex flex-col gap-2">
								<Label className="text-lg font-medium">Password</Label>
								<PasswordInput
									type="password"
									defaultValue={state.value}
									onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
										handleChange(e.target.value)
									}
									onBlur={handleBlur}
									placeholder="Enter your password"
									required
								/>
								{!state.meta.isValid && (
									<Alert variant="destructive" className="rounded-md p-2">
										<AlertDescription>
											{state.meta.errors[0]?.message}
										</AlertDescription>
									</Alert>
								)}
							</div>
						)}
					</Field>

					<Field name="confirmPassword">
						{({ state, handleChange, handleBlur }) => (
							<div className="flex flex-col gap-2">
								<Label className="text-lg font-medium">Confirm Password</Label>
								<PasswordInput
									type="password"
									defaultValue={state.value}
									onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
										handleChange(e.target.value)
									}
									onBlur={handleBlur}
									placeholder="Confirm your password"
									required
								/>
								{!state.meta.isValid && (
									<Alert variant="destructive" className="rounded-md p-2">
										<AlertDescription>
											{state.meta.errors[0]?.message}
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

					<div className="flex justify-end">
						<Button
							type="submit"
							className="w-full hover:cursor-pointer"
							disabled={isLoading}
						>
							{isLoading ? "Signing up..." : "Sign up"}
						</Button>
					</div>
				</form>
				<div className="flex flex-col gap-2 mt-4 tracking-tight">
					<div className="flex text-xs text-foreground/30 justify-between">
						<p>Already have an account?</p>
						<Link
							to="/login"
							className="text-foreground/50 flex gap-2 items-center hover:text-foreground/70 transition duration-300"
						>
							Log in <ArrowRight className="w-3 h-3" />
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}
