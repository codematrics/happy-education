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
import { BookOpen, LogOut, Menu, Shield, User, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Avatar, AvatarFallback } from "../ui/avatar";

const AppNavbar = () => {
  const { data, refetch, isPending, isLoading } = useAuthCheck();
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
      console.error("लॉगआउट असफल:", error);
      refetch();
    }
  };

  const navLinks = [
    { href: "/", label: "होम" },
    { href: "/courses", label: "कोर्स" },
    { href: "/testimonials", label: "प्रशंसापत्र" },
    { href: "/contact", label: "संपर्क करें" },
  ];

  const authenticatedLinks = [
    { href: "/my-courses", label: "मेरे पाठ्यक्रम", icon: BookOpen },
    { href: "/profile", label: "प्रोफ़ाइल", icon: User },
  ];

  const pathName = usePathname();
  const eventPage = pathName.includes("/event/");

  const adminLinks = [{ href: "/admin", label: "एडमिन", icon: Shield }];

  return (
    <header
      className={`${
        eventPage ? "bg-[#0eff094a]" : "bg-background/80"
      } fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b border-border shadow-soft`}
    >
      <div className="container mx-auto px-4 py-4 relative flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center space-x-2 transition-smooth hover:scale-105"
        >
          <div className="rounded-xl">
            <Image
              src={Logo}
              alt="Happy-Education"
              className="w-9 h-9 text-white"
            />
          </div>
          <span className="text-xl font-bold max-md:hidden">
            हैप्पी एजुकेशन
          </span>
        </Link>

        {/* Desktop Navigation */}
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

        {/* Auth Buttons */}
        <div className="hidden md:flex items-center space-x-4">
          {isPending || isLoading ? (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-muted animate-pulse" />
              <div className="h-3 w-16 bg-muted rounded animate-pulse" />
            </div>
          ) : !isAuthenticated ? (
            <>
              <Link href="/signin">
                <Button variant="ghost">लॉगिन</Button>
              </Link>
              <Link href="/signup">
                <Button className="gradient-primary text-white border-0 shadow-medium hover:shadow-strong transition-smooth">
                  साइन अप करें
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
                  <Avatar>
                    <AvatarFallback className="text-xs">यू</AvatarFallback>
                  </Avatar>
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
                  लॉगआउट
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
              {isPending || isLoading ? (
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-muted animate-pulse" />
                  <div className="h-3 w-16 bg-muted rounded animate-pulse" />
                </div>
              ) : !isAuthenticated ? (
                <>
                  <Link href="/signin" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-center">
                      लॉगिन
                    </Button>
                  </Link>
                  <Link href="/signup" onClick={() => setIsMenuOpen(false)}>
                    <Button className="w-full gradient-primary text-white border-0">
                      साइन अप करें
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  {(role === "user" || role === "both") && (
                    <Link href="/profile" onClick={() => setIsMenuOpen(false)}>
                      <Avatar>
                        <AvatarFallback className="text-xs">यू</AvatarFallback>
                      </Avatar>
                    </Link>
                  )}
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-red-600 hover:text-red-600 hover:bg-red-50"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    लॉगआउट
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
