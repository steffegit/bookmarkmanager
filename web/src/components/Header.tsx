import { Link } from "@tanstack/react-router";
import { Download, Github, LogIn, LogOut, Menu, User } from "lucide-react";
import { useState } from "react";
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
import { Button } from "./ui/button";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";

const navLinks = [
  {
    label: "Dashboard",
    to: "/",
  },
  {
    label: "Collections",
    to: "/collections",
  },
  {
    label: "Settings",
    to: "/settings",
  },
];

const exportBookmarks = () => {
  console.log("exporting bookmarks coming soon...");
  toast.info("Exporting bookmarks coming soon...");
};

export default function Header() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
  };

  const { isAuthenticated } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  console.log("isAuthenticated", isAuthenticated);

  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop)
    return (
      <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur-md py-1 px-2 border-b-1 border-accent-foreground/10 mb-4">
        <nav className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex gap-2 items-center">
            <img
              src="https://placehold.co/400"
              alt="Logo"
              className="w-8 h-8 rounded-md hover:scale-105 transition-transform duration-200"
            />
            {navLinks.map((link) => (
              <Button
                variant="ghost"
                size="sm"
                key={link.to}
                className="px-2 tracking-tight"
              >
                <Link to={link.to}>{link.label}</Link>
              </Button>
            ))}
          </div>
          <div className="flex gap-2 items-center tracking-tight">
            <a
              href="https://github.com/steffegit/bookmarkmanager"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full hover:cursor-pointer"
              >
                <Github />
              </Button>
            </a>
            {!isAuthenticated && (
              <Button
                variant="outline"
                size="xs"
                className="hover:cursor-pointer"
              >
                <Link to="/login" className="flex items-center gap-2">
                  <LogIn className="scale-80" />
                  Log In
                </Link>
              </Button>
            )}
            <Button
              variant="default"
              size="xs"
              disabled
              className="hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => {
                exportBookmarks();
              }}
            >
              <Download className="scale-80" />
              Export
            </Button>
            {isAuthenticated && (
              <>
                <Button
                  variant="outline"
                  size="xs"
                  className="hover:cursor-pointer"
                >
                  <Link to="/logout" className="flex items-center gap-2">
                    <LogOut className="scale-80" />
                    Log Out
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="hover:cursor-pointer rounded-full scale-80 -ml-1"
                >
                  <Link to="/profile" className="flex items-center">
                    <User />
                  </Link>
                </Button>
              </>
            )}
          </div>
        </nav>
      </header>
    );

  // Mobile view with top sheet
  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur-md py-2 px-4 border-b-1 border-accent-foreground/10 mb-4">
      <nav className="flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex gap-2 items-center">
          <img
            src="https://placehold.co/400"
            alt="Logo"
            className="w-8 h-8 rounded-md hover:scale-105 transition-transform duration-200"
          />
        </div>
        <div className="flex gap-2 items-center tracking-tight">
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <VisuallyHidden.Root>
              <SheetTitle>Menu</SheetTitle>
              <SheetDescription>
                Menu for the bookmark manager.
              </SheetDescription>
            </VisuallyHidden.Root>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-md hover:cursor-pointer"
              >
                <Menu className="h-4 w-4 scale-120" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="bottom"
              className="border-accent-foreground/10 p-2 pb-12"
              showClose={false}
            >
              <div className="flex flex-col">
                <div className="flex flex-col gap-1">
                  {navLinks.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      className="flex items-center px-2 py-2 text-sm tracking-tight hover:bg-accent rounded-md transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>

                <Separator className="my-2" />

                <div className="flex flex-col gap-1">
                  {!isAuthenticated && (
                    <Button variant="ghost" className="w-full justify-start">
                      <Link
                        to="/login"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex gap-2 items-center justify-start"
                      >
                        <LogIn className="h-4 w-4 -ml-1" />
                        Log In
                      </Link>
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    disabled
                    onClick={() => {
                      exportBookmarks();
                      setIsMenuOpen(false);
                    }}
                    className="w-full justify-start"
                  >
                    <Download className="h-4 w-4" />
                    Export
                  </Button>

                  {isAuthenticated && (
                    <>
                      <Button variant="ghost" className="w-full justify-start">
                        <Link
                          to="/profile"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex gap-2 items-center justify-start w-full"
                        >
                          <User className="h-4 w-4 -ml-1" />
                          Profile
                        </Link>
                      </Button>
                      <Button variant="ghost" className="w-full justify-start">
                        <Link
                          to="/logout"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex gap-2 items-center justify-start w-full"
                        >
                          <LogOut className="h-4 w-4 -ml-1" />
                          Log Out
                        </Link>
                      </Button>
                    </>
                  )}
                </div>

                <div className="my-1" />

                <div className="flex flex-col gap-1">
                  <Button
                    variant="outline"
                    className="w-full tracking-tight"
                    onClick={toggleTheme}
                  >
                    Toggle {theme === "dark" ? "Light" : "Dark"} Mode On
                  </Button>

                  <Button
                    variant="ghost"
                    className="w-full tracking-tight"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Close menu
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
