import { Link, useNavigate } from "@tanstack/react-router";
import { Download, Github, LogIn, LogOut, Menu, User } from "lucide-react";
import { useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import { useMediaQuery } from "usehooks-ts";
import { Separator } from "@/components/ui/separator";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "./theme-provider";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";

const navLinks = [
	{ label: "Dashboard", to: "/" },
	{ label: "Collections", to: "/collections" },
	{ label: "Settings", to: "/settings" },
];

function KbdBadge({
	children,
	variant = "default",
}: { children: React.ReactNode; variant?: "default" | "primary" }) {
	if (variant === "primary") {
		return (
			<kbd className="ml-1.5 inline-flex h-[16px] min-w-[16px] items-center justify-center rounded-[3px] bg-white/20 border border-white/30 px-[3px] text-[9px] font-medium text-white/80 leading-none tracking-normal">
				{children}
			</kbd>
		);
	}
	return (
		<kbd className="ml-1.5 inline-flex h-[16px] min-w-[16px] items-center justify-center rounded-[3px] bg-foreground/[0.12] border border-foreground/[0.22] px-[3px] text-[9px] font-medium text-foreground/70 leading-none tracking-normal">
			{children}
		</kbd>
	);
}

function LogoMark() {
	return (
		<div className="flex items-center gap-2 select-none">
			<div className="w-6 h-6 bg-primary rounded-[4px] flex items-center justify-center text-[11px] font-bold text-primary-foreground font-mono leading-none">
				B
			</div>
			<span className="text-sm font-semibold tracking-tight text-foreground">
				bookmarkr
			</span>
		</div>
	);
}

const exportBookmarks = () => {
	toast.info("Exporting bookmarks coming soon...");
};

export default function Header() {
	const { theme, setTheme } = useTheme();
	const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

	const { isAuthenticated } = useAuth();
	const navigate = useNavigate();
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const isDesktop = useMediaQuery("(min-width: 768px)");

	useHotkeys("l", () => navigate({ to: "/login" }), {
		enabled: !isAuthenticated,
		preventDefault: true,
	});

	if (isDesktop)
		return (
			<header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl">
				<nav className="flex justify-between items-center max-w-7xl mx-auto px-4 h-11">
					<div className="flex items-center gap-1">
						<Link to="/" className="mr-3">
							<LogoMark />
						</Link>
						{navLinks.map((link) => (
							<Link
								key={link.to}
								to={link.to}
								className="px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors duration-150 rounded-sm hover:bg-foreground/[0.06]"
							>
								{link.label}
							</Link>
						))}
					</div>

					<div className="flex items-center gap-1">
						<a
							href="https://github.com/steffegit/bookmarkmanager"
							target="_blank"
							rel="noopener noreferrer"
							className="w-7 h-7 flex items-center justify-center rounded-sm text-muted-foreground hover:text-foreground hover:bg-foreground/[0.06] transition-colors"
						>
							<Github className="w-3.5 h-3.5" />
						</a>

						<div className="w-px h-4 bg-border mx-1" />

						{!isAuthenticated && (
							<Link to="/login">
								<button
									type="button"
									className="flex items-center gap-1.5 h-7 px-2.5 text-xs text-muted-foreground hover:text-foreground border border-border hover:border-border/80 rounded-sm bg-transparent hover:bg-foreground/[0.04] transition-all duration-150"
								>
									<LogIn className="w-3 h-3" />
									Log in
									<KbdBadge>L</KbdBadge>
								</button>
							</Link>
						)}

						{isAuthenticated && (
							<>
								<Link to="/profile">
									<button
										type="button"
										className="w-7 h-7 flex items-center justify-center rounded-sm text-muted-foreground hover:text-foreground hover:bg-foreground/[0.06] transition-colors"
									>
										<User className="w-3.5 h-3.5" />
									</button>
								</Link>
								<Link to="/logout">
									<button
										type="button"
										className="w-7 h-7 flex items-center justify-center rounded-sm text-muted-foreground hover:text-foreground hover:bg-foreground/[0.06] transition-colors"
									>
										<LogOut className="w-3.5 h-3.5" />
									</button>
								</Link>
							</>
						)}

						<button
							type="button"
							disabled
							onClick={exportBookmarks}
							className="flex items-center gap-1.5 h-7 px-2.5 text-xs bg-primary text-primary-foreground rounded-sm hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed font-medium"
						>
							<Download className="w-3 h-3" />
							Export
							<KbdBadge variant="primary">E</KbdBadge>
						</button>
					</div>
				</nav>
			</header>
		);

	return (
		<header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl">
			<nav className="flex justify-between items-center max-w-7xl mx-auto px-4 h-11">
				<Link to="/">
					<LogoMark />
				</Link>

				<Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
					<VisuallyHidden.Root>
						<SheetTitle>Menu</SheetTitle>
						<SheetDescription>Navigation menu</SheetDescription>
					</VisuallyHidden.Root>
					<SheetTrigger asChild>
						<button
							type="button"
							className="w-7 h-7 flex items-center justify-center rounded-sm text-muted-foreground hover:text-foreground hover:bg-foreground/[0.06] transition-colors"
						>
							<Menu className="w-4 h-4" />
						</button>
					</SheetTrigger>
					<SheetContent
						side="bottom"
						className="border-t border-border/60 bg-background/95 backdrop-blur-xl p-0 pb-safe"
						showClose={false}
					>
						<div className="flex flex-col p-3 gap-1">
							{navLinks.map((link) => (
								<Link
									key={link.to}
									to={link.to}
									onClick={() => setIsMenuOpen(false)}
									className="flex items-center px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-foreground/[0.05] rounded-sm transition-colors"
								>
									{link.label}
								</Link>
							))}

							<Separator className="my-1 bg-border/60" />

							{!isAuthenticated && (
								<Link
									to="/login"
									onClick={() => setIsMenuOpen(false)}
									className="flex items-center gap-2 px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-foreground/[0.05] rounded-sm transition-colors"
								>
									<LogIn className="w-3.5 h-3.5" />
									Log in
								</Link>
							)}

							<button
								type="button"
								disabled
								onClick={() => { exportBookmarks(); setIsMenuOpen(false); }}
								className="flex items-center gap-2 px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-foreground/[0.05] rounded-sm transition-colors text-left disabled:opacity-40"
							>
								<Download className="w-3.5 h-3.5" />
								Export bookmarks
							</button>

							{isAuthenticated && (
								<>
									<Link
										to="/profile"
										onClick={() => setIsMenuOpen(false)}
										className="flex items-center gap-2 px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-foreground/[0.05] rounded-sm transition-colors"
									>
										<User className="w-3.5 h-3.5" />
										Profile
									</Link>
									<Link
										to="/logout"
										onClick={() => setIsMenuOpen(false)}
										className="flex items-center gap-2 px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-foreground/[0.05] rounded-sm transition-colors"
									>
										<LogOut className="w-3.5 h-3.5" />
										Log out
									</Link>
								</>
							)}

							<Separator className="my-1 bg-border/60" />

							<button
								type="button"
								onClick={toggleTheme}
								className="flex items-center gap-2 px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-foreground/[0.05] rounded-sm transition-colors text-left"
							>
								{theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
							</button>

							<button
								type="button"
								onClick={() => setIsMenuOpen(false)}
								className="flex items-center gap-2 px-3 py-2.5 text-sm text-muted-foreground/50 hover:text-muted-foreground hover:bg-foreground/[0.05] rounded-sm transition-colors text-left"
							>
								Close
							</button>
						</div>
					</SheetContent>
				</Sheet>
			</nav>
		</header>
	);
}
