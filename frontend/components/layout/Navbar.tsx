"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Sparkles, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/AiAssistant', label: 'AI Assistant' },
    { href: '/hrDash', label: 'HR Dashboard' },
    { href: '/privacy', label: 'Privacy Policy' },
    { href: '/contact', label: 'Contact' },
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-tl from-slate-800 to-accent w-[97%] mx-auto my-4 rounded-xl">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-accent-foreground" />
              </div>
              <span className="font-serif text-xl font-bold">
                Alexander<span className="text-black">.Ai</span>
              </span>
            </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors relative py-2",
                  isActive(link.href)
                    ? "text-foreground"
                    : "text-gray-100 hover:text-foreground"
                )}
              >
                {link.label}
                {isActive(link.href) && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-full" />
                )}
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1">
                  Get Started
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/login" className="cursor-pointer">Sign In</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/signup/applicant" className="cursor-pointer">Join as Applicant</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/signup/hr" className="cursor-pointer">Join as HR</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button className='rounded-full' variant="hero" size="sm" asChild>
              <Link href="/login">Login</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border/50 animate-fade-in">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                    isActive(link.href)
                      ? "bg-accent/10 text-foreground"
                      : "text-muted-foreground hover:bg-muted/50"
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex flex-col gap-2 mt-4 px-4">
                <Button variant="outline" asChild className="w-full rounded-full">
                  <Link href="/login" onClick={() => setIsOpen(false)}>Sign In</Link>
                </Button>
                <Button variant="hero" asChild className="w-full">
                  <Link href="/signup/applicant" onClick={() => setIsOpen(false)}>Get Started</Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;


