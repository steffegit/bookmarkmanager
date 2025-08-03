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
		<div className="flex flex-col items-center justify-center h-screen">
			<p className="text-2xl font-bold">Logging out...</p>
		</div>
	);
}
