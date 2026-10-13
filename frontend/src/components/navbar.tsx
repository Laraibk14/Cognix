"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Brain, Home, Menu, BarChart3, Database, UserRound, ClipboardCheck, LineChart, ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { BrandLogo } from "@/components/brand-logo";

type Role = "student" | "teacher";
type Session = { role: Role };

const teacherLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/generate", label: "Generate", icon: Brain },
  { href: "/evaluate", label: "Evaluate", icon: ClipboardCheck },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
];

const studentLinks = [
  { href: "/question-bank", label: "Question Bank", icon: Database },
  { href: "/attempt-tests", label: "Attempt Tests", icon: ListChecks },
  { href: "/results", label: "Results", icon: LineChart },
];

function readSession(): Session | null {
  if (typeof window === "undefined") return null;
  const saved = window.localStorage.getItem("preppilot-session");
  if (!saved) return null;
  try {
    const parsed = JSON.parse(saved) as Session;
    return parsed.role === "teacher" || parsed.role === "student" ? parsed : null;
  } catch {
    return null;
  }
}

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const signedIn = Boolean(session);
  const navLinks = session?.role === "teacher" ? teacherLinks : session?.role === "student" ? studentLinks : [];

  useEffect(() => {
    const updateSession = () => setSession(readSession());
    updateSession();
    window.addEventListener("preppilot-session-change", updateSession);
    return () => window.removeEventListener("preppilot-session-change", updateSession);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/70 bg-background/90 text-foreground shadow-[0_4px_24px_-18px_rgba(57,45,140,0.45)] backdrop-blur-xl">
      <div className="container mx-auto flex h-20 items-center justify-between px-4">
        <BrandLogo className="h-12 w-[155px] object-left" priority />

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          <nav className="flex items-center gap-1 rounded-2xl border border-border/60 bg-card/70 p-1 shadow-sm">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link key={link.href} href={link.href}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    size="sm"
                    className={cn("gap-2 rounded-xl px-3", isActive && "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90")}
                  >
                    <Icon className="h-4 w-4" />
                    {link.label}
                  </Button>
                </Link>
              );
            })}
          </nav>
          <ThemeToggle />
          <Link href="/auth">
            <Button size="sm" variant={signedIn ? "outline" : "default"} className="ml-2 gap-2 px-4 shadow-md shadow-primary/20">
              <UserRound className="h-3.5 w-3.5" />
              {signedIn ? "My profile" : "Log in"}
            </Button>
          </Link>
        </div>

        {/* Mobile nav */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[320px]">
              <SheetHeader className="mb-6">
                <SheetTitle className="flex items-center gap-2">
                  <BrandLogo className="h-10 w-[150px] object-left" />
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setOpen(false)}
                    >
                      <Button
                        variant={isActive ? "secondary" : "ghost"}
                        size="lg"
                        className={cn(
                          "w-full justify-start gap-3 text-base",
                          isActive && "font-semibold bg-primary/10"
                        )}
                      >
                        <Icon className="h-5 w-5" />
                        {link.label}
                      </Button>
                    </Link>
                  );
                })}
                <Link href="/auth" onClick={() => setOpen(false)} className="mt-3 border-t pt-3">
                  <Button
                    variant={signedIn ? "outline" : "default"}
                    size="lg"
                    className="w-full justify-start gap-3 text-base"
                  >
                    <UserRound className="h-5 w-5" />
                    {signedIn ? "My profile" : "Log in / Sign up"}
                  </Button>
                </Link>
              </nav>
              <div className="absolute bottom-6 left-6 right-6">
                <div className="rounded-lg border bg-muted/50 p-4">
                  <p className="text-xs text-muted-foreground text-center">
                    AI-Powered Question Paper Generator
                  </p>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
