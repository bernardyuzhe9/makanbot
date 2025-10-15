"use client";
import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  NavbarLogo,
  NavbarButton,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "@/components/ui/resizable-navbar";
import { useState } from "react";
import Link from "next/link";
import { BentoGridDemo } from "@/components/ui/structure-bento";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { AuthModal } from "./auth-modal";

export function NavbarMakanBot({ showDummyContent = true }) {
  const { theme, setTheme } = useTheme();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const navItems = [
    {
      name: "MakanBot",
      link: "/makanbot",
    },
    {
      name: "Features",
      link: "/",
    },
  ];

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="relative w-full">
      <Navbar>
        {/* Desktop Navigation */}
        <NavBody>
          <NavbarLogo />
          <NavItems items={navItems} />
          <div className="flex items-center gap-4">
            <button
              aria-label="Toggle theme"
              className="relative inline-flex items-center justify-center h-9 w-9 rounded-md border border-neutral-200 text-neutral-800 transition-colors hover:bg-neutral-100 dark:border-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-900"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              <span className="relative block h-[1.2rem] w-[1.2rem]">
                <Sun className="absolute inset-0 h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
                <Moon className="absolute inset-0 h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
              </span>
            </button>
            <NavbarButton variant="secondary" onClick={() => setIsAuthModalOpen(true)}>Login</NavbarButton>
            <NavbarButton variant="primary" onClick={() => setIsAuthModalOpen(true)}>Sign Up</NavbarButton>
          </div>
        </NavBody>

        {/* Mobile Navigation */}
        <MobileNav>
          <MobileNavHeader>
            <NavbarLogo />
            <MobileNavToggle
              isOpen={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
          </MobileNavHeader>

          <MobileNavMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)}>
            {navItems.map((item, idx) => (
              <Link
                key={`mobile-link-${idx}`}
                href={item.link}
                onClick={() => setIsMobileMenuOpen(false)}
                className="relative text-neutral-600 dark:text-neutral-300">
                <span className="block">{item.name}</span>
              </Link>
            ))}
            <div className="flex w-full flex-col gap-4">
              <button
                aria-label="Toggle theme"
                className="relative inline-flex items-center justify-center h-10 w-full rounded-md border border-neutral-200 text-neutral-800 transition-colors hover:bg-neutral-100 dark:border-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-900"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                <span className="relative inline-flex items-center gap-2">
                  <span className="relative block h-4 w-4">
                    <Sun className="absolute inset-0 h-4 w-4 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
                    <Moon className="absolute inset-0 h-4 w-4 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
                  </span>
                  Toggle theme
                </span>
              </button>
              <NavbarButton
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsAuthModalOpen(true);
                }}
                variant="primary"
                className="w-full">
                Login
              </NavbarButton>
              <NavbarButton
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsAuthModalOpen(true);
                }}
                variant="primary"
                className="w-full">
                Sign Up
              </NavbarButton>
            </div>
          </MobileNavMenu>
        </MobileNav>
      </Navbar>
      {/* Navbar */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </div>
  );
}
