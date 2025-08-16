"use client";

import Logo from "@/../public/logo/logo.png";
import { Button } from "@/components/ui/button";
import { LogOut, Menu, User, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const AppNavbar = ({
  isAuthenticated,
  role,
}: {
  role: "both" | "user" | "admin" | null;
  isAuthenticated: boolean;
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/courses", label: "Courses" },
    { href: "/testimonials", label: "Testimonials" },
    { href: "/contact", label: "Contact" },
  ];

  const authenticatedLinks = [
    { href: "/my-courses", label: "My Courses" },
    { href: "/profile", label: "Profile" },
  ];

  const adminLinks = [{ href: "/admin", label: "Admin" }];

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
          {isAuthenticated &&
            authenticatedLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-medium transition-smooth hover:text-primary"
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
              >
                {link.label}
              </Link>
            ))}
        </nav>

        {/* Auth Buttons (Right) */}
        <div className="hidden md:flex items-center space-x-4">
          {!isAuthenticated ? (
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
            <div className="flex items-center space-x-4">
              {(role === "user" || role === "both") && (
                <Link href="/profile">
                  <Button variant="ghost" size="icon">
                    <User className="w-4 h-4" />
                  </Button>
                </Link>
              )}
              <Button variant="ghost" size="icon">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
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
              {!isAuthenticated ? (
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
                    className="w-full justify-start"
                    // onClick={handleLogout}
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
