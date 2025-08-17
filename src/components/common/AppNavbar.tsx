"use client";

import Logo from "@/../public/logo/logo.png";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthCheck } from "@/hooks/useAuth";
import {
  BookOpen,
  CircleUser,
  LogOut,
  Menu,
  Shield,
  User,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const AppNavbar = () => {
  const { data, refetch, isLoading } = useAuthCheck();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  const role = data?.data?.role;
  const isAuthenticated = data?.data?.isLoggedIn;

  const handleLogout = async () => {
    try {
      await fetch("/signout", { method: "POST" });
      router.push("/");
      refetch();
    } catch (error) {
      console.error("Logout failed:", error);
      refetch();
    }
  };

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/courses", label: "Courses" },
    { href: "/testimonials", label: "Testimonials" },
    { href: "/contact", label: "Contact" },
  ];

  const authenticatedLinks = [
    { href: "/my-courses", label: "My Courses", icon: BookOpen },
    { href: "/profile", label: "Profile", icon: User },
  ];

  const adminLinks = [{ href: "/admin", label: "Admin", icon: Shield }];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border shadow-soft">
      <div className="container mx-auto px-4 py-4 relative flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center space-x-2 transition-smooth hover:scale-105"
        >
          <div className="rounded-xl gradient-primary">
            <Image
              src={Logo}
              alt="Happy-Education"
              className="w-9 h-9 text-white"
            />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-info bg-clip-text text-transparent max-md:hidden">
            Happy Education
          </span>
        </Link>

        {/* Desktop Navigation (centered) */}
        <nav className="hidden md:flex items-center space-x-8 absolute left-1/2 -translate-x-1/2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-medium transition-smooth hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Auth Buttons (Right) */}
        <div className="hidden md:flex items-center space-x-4">
          {isLoading ? (
            // Show loading indicator while checking auth
            <span className="text-sm text-muted-foreground animate-pulse">
              Checking...
            </span>
          ) : !isAuthenticated ? (
            <>
              <Link href="/signin">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/signup">
                <Button className="gradient-primary text-white border-0 shadow-medium hover:shadow-strong transition-smooth">
                  Sign Up
                </Button>
              </Link>
            </>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild className="p-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative rounded-full hover:bg-primary/10 transition-colors p-0"
                >
                  <CircleUser className="w-9 h-9" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {/* User Links */}
                {authenticatedLinks.map((link) => (
                  <DropdownMenuItem key={link.href} asChild>
                    <Link href={link.href} className="cursor-pointer">
                      <link.icon className="w-4 h-4 mr-2" />
                      {link.label}
                    </Link>
                  </DropdownMenuItem>
                ))}

                {/* Admin Links */}
                {isAuthenticated && (role === "admin" || role === "both") && (
                  <>
                    <DropdownMenuSeparator />
                    {adminLinks.map((link) => (
                      <DropdownMenuItem key={link.href} asChild>
                        <Link href={link.href} className="cursor-pointer">
                          <link.icon className="w-4 h-4 mr-2" />
                          {link.label}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </>
                )}

                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer text-red-600 focus:text-red-600"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </Button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden mt-4 px-4 pb-4 border-t border-border">
          <nav className="flex flex-col space-y-4 mt-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-medium transition-smooth hover:text-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {isAuthenticated &&
              authenticatedLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="font-medium transition-smooth hover:text-primary"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            {isAuthenticated &&
              (role === "admin" || role === "both") &&
              adminLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="font-medium transition-smooth hover:text-primary"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            <div className="flex flex-col space-y-2 pt-4">
              {isLoading ? (
                <span className="text-sm text-muted-foreground animate-pulse">
                  Checking...
                </span>
              ) : !isAuthenticated ? (
                <>
                  <Link href="/signin" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-center">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/signup" onClick={() => setIsMenuOpen(false)}>
                    <Button className="w-full gradient-primary text-white border-0">
                      Sign Up
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  {(role === "user" || role === "both") && (
                    <Link href="/profile" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start">
                        <User className="w-4 h-4 mr-2" />
                        Profile
                      </Button>
                    </Link>
                  )}
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-red-600 hover:text-red-600 hover:bg-red-50"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default AppNavbar;
