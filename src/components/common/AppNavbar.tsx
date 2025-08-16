"use client";

import Logo from "@/../public/logo/logo.png";
import { Button } from "@/components/ui/button";
import { LogOut, Menu, User, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const AppNavbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathName = usePathname();
  // const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  const isAuthenticated = false;
  // const userRole = localStorage.getItem("userRole") || "user";
  const userRole = "user";

  // const handleLogout = () => {
  //   localStorage.removeItem("isAuthenticated");
  //   localStorage.removeItem("userRole");
  //   window.location.href = "/";
  // };

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/courses", label: "Courses" },
    { href: "/testimonials", label: "Testimonials" },
    { href: "/contact", label: "Contact" },
  ];

  const authenticatedLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/profile", label: "Profile" },
  ];

  const adminLinks = [{ href: "/admin", label: "Admin" }];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border shadow-soft">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center space-x-2 transition-smooth hover:scale-105"
          >
            <div className="p-2 rounded-xl gradient-primary">
              <Image
                src={Logo}
                alt="Happy-Education"
                className="w-6 h-6 text-white"
              />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-info bg-clip-text text-transparent">
              Happy Education
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`font-medium transition-smooth hover:text-primary ${
                  // location.pathname === link.href
                  // ? "text-primary"
                  // : "text-foreground"
                  ""
                }`}
              >
                {link.label}
              </Link>
            ))}
            {isAuthenticated &&
              authenticatedLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`font-medium transition-smooth hover:text-primary ${
                    location.pathname === link.href
                      ? "text-primary"
                      : "text-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            {isAuthenticated &&
              // userRole === "admin" &&
              adminLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`font-medium transition-smooth hover:text-primary ${
                    location.pathname === link.href
                      ? "text-primary"
                      : "text-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
          </nav>

          {/* Auth Buttons */}
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
                <Link href="/profile">
                  <Button variant="ghost" size="icon">
                    <User className="w-4 h-4" />
                  </Button>
                </Link>
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

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-border">
            <nav className="flex flex-col space-y-4 mt-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`font-medium transition-smooth hover:text-primary ${
                    location.pathname === link.href
                      ? "text-primary"
                      : "text-foreground"
                  }`}
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
                    className={`font-medium transition-smooth hover:text-primary ${
                      location.pathname === link.href
                        ? "text-primary"
                        : "text-foreground"
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              {isAuthenticated &&
                // userRole === "admin" &&
                adminLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`font-medium transition-smooth hover:text-primary ${
                      location.pathname === link.href
                        ? "text-primary"
                        : "text-foreground"
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              <div className="flex flex-col space-y-2 pt-4">
                {!isAuthenticated ? (
                  <>
                    <Link href="/signin" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start">
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
                    <Link href="/profile" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start">
                        <User className="w-4 h-4 mr-2" />
                        Profile
                      </Button>
                    </Link>
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
      </div>
    </header>
  );
};

export default AppNavbar;
