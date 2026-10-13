"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { ArrowRight, BookOpen, CheckCircle2, GraduationCap, LogIn, ShieldCheck, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { BrandLogo } from "@/components/brand-logo";
import { api, type AppUser } from "@/lib/api";
import { courses } from "@/lib/courses";

type Role = "student" | "teacher";
type LocalUser = AppUser;

const SESSION_KEY = "preppilot-session";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [role, setRole] = useState<Role>("student");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [course, setCourse] = useState(courses[0].id);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [session, setSession] = useState<LocalUser | null>(() => {
    if (typeof window === "undefined") return null;
    const saved = window.localStorage.getItem(SESSION_KEY);
    if (!saved) return null;
    try {
      return JSON.parse(saved) as LocalUser;
    } catch {
      window.localStorage.removeItem(SESSION_KEY);
      return null;
    }
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail.includes("@")) {
      setError("Enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setError("Your password must be at least 6 characters.");
      return;
    }

    if (mode === "signup") {
      if (!name.trim()) {
        setError("Tell us your name to create your profile.");
        return;
      }
      const enrollments = role === "student"
        ? [{ course, course_name: courses.find((item) => item.id === course)?.name || course }]
        : [];
      try {
        const newUser = await api.signup({ name: name.trim(), email: normalizedEmail, password, role, enrollments });
        window.localStorage.setItem(SESSION_KEY, JSON.stringify(newUser));
        setSession(newUser);
        window.dispatchEvent(new Event("preppilot-session-change"));
        setNotice("Your database-backed COGNIX profile is ready.");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to create account.");
      }
      return;
    }

    try {
      const user = await api.login({ email: normalizedEmail, password, role });
      window.localStorage.setItem(SESSION_KEY, JSON.stringify(user));
      setSession(user);
      window.dispatchEvent(new Event("preppilot-session-change"));
      setNotice("Welcome back to COGNIX.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to log in.");
    }
  }

  function signOut() {
    window.localStorage.removeItem(SESSION_KEY);
    setSession(null);
    window.dispatchEvent(new Event("preppilot-session-change"));
    setNotice("You have been signed out of this browser.");
  }

  if (session) {
    return (
      <main className="min-h-[calc(100vh-4.5rem)] bg-[radial-gradient(circle_at_20%_0%,oklch(0.94_0.08_275_/_0.8),transparent_28rem)] px-4 py-12">
        <Card className="mx-auto max-w-2xl border-primary/10 bg-card/85 shadow-xl shadow-primary/10 backdrop-blur">
          <CardContent className="p-8 text-center md:p-12">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-indigo-400 text-white shadow-lg shadow-primary/25">
              {session.role === "student" ? <GraduationCap className="h-8 w-8" /> : <Users className="h-8 w-8" />}
            </div>
            <p className="mt-6 text-sm font-semibold uppercase tracking-widest text-primary">Local profile active</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight">Welcome, {session.name}!</h1>
            <p className="mx-auto mt-3 max-w-md text-muted-foreground">
              You&apos;re signed in as a <span className="font-semibold text-foreground">{session.role}</span>. Your COGNIX workspace is ready for focused learning.
            </p>
            {notice && <p className="mt-4 text-sm text-emerald-600">{notice}</p>}
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href={session.role === "student" ? "/question-bank" : "/generate"}>
                <Button size="lg" className="gap-2 shadow-lg shadow-primary/20">
                  {session.role === "student" ? "Explore practice" : "Create a paper"} <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" onClick={signOut}>Sign out</Button>
            </div>
            <p className="mt-8 flex items-center justify-center gap-2 text-xs text-muted-foreground"><ShieldCheck className="h-4 w-4 text-amber-500" /> Demo mode: account data stays in this browser only.</p>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-4.5rem)] bg-[radial-gradient(circle_at_15%_5%,oklch(0.94_0.09_275_/_0.8),transparent_28rem),radial-gradient(circle_at_90%_90%,oklch(0.93_0.09_195_/_0.55),transparent_25rem)] px-4 py-10 md:py-16">
      <div className="mx-auto grid max-w-5xl items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="hidden lg:block">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-card/70 px-3 py-1.5 text-xs font-bold text-primary shadow-sm"><Sparkles className="h-3.5 w-3.5 text-amber-500" /> Learn better with COGNIX</div>
          <h1 className="text-5xl font-black leading-tight tracking-tight">Your next breakthrough starts here.</h1>
          <p className="mt-5 max-w-md leading-relaxed text-muted-foreground">Create a focused practice routine as a student, or build better assessments as a teacher.</p>
          <div className="mt-8 space-y-4 text-sm font-medium">
            {["Personalized practice workspace", "Five focused university subjects", "Simple tools for every learning goal"].map((item) => <div key={item} className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-emerald-500" />{item}</div>)}
          </div>
        </div>

        <Card className="border-primary/10 bg-card/90 shadow-2xl shadow-indigo-900/10 backdrop-blur">
          <CardHeader className="p-6 pb-2 md:p-8 md:pb-3">
            <BrandLogo className="mb-5 h-12 w-[175px] object-left" />
            <div className="flex gap-2 rounded-xl bg-muted p-1">
              {(["login", "signup"] as const).map((item) => <button key={item} type="button" onClick={() => { setMode(item); setError(""); setNotice(""); }} className={cn("flex-1 rounded-lg px-4 py-2 text-sm font-bold capitalize transition-all", mode === item ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground")}>{item === "login" ? "Log in" : "Create account"}</button>)}
            </div>
            <CardTitle className="mt-5 text-2xl font-black">{mode === "login" ? "Welcome back" : "Start your learning journey"}</CardTitle>
            <CardDescription>{mode === "login" ? "Log in to continue where you left off." : "Choose your role and create a local profile in seconds."}</CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-4 md:p-8 md:pt-5">
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "signup" && <div className="space-y-2"><Label htmlFor="name" className="font-semibold">Full name</Label><Input id="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Alex Johnson" className="h-11 rounded-xl bg-muted/30 px-4" /></div>}
              <div className="space-y-2"><Label htmlFor="email" className="font-semibold">Email address</Label><Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="h-11 rounded-xl bg-muted/30 px-4" /></div>
              <div className="space-y-2"><Label htmlFor="password" className="font-semibold">Password</Label><Input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 6 characters" className="h-11 rounded-xl bg-muted/30 px-4" /></div>
              <div className="space-y-2"><Label className="font-semibold">I&apos;m joining as a...</Label><div className="grid grid-cols-2 gap-3">{(["student", "teacher"] as Role[]).map((item) => <button key={item} type="button" onClick={() => setRole(item)} className={cn("flex items-center gap-2 rounded-xl border p-3 text-left text-sm font-bold capitalize transition-all", role === item ? "border-primary bg-primary/5 text-primary ring-2 ring-primary/10" : "border-border hover:border-primary/40")}><span className={cn("rounded-lg p-2", role === item ? "bg-primary text-white" : "bg-muted")}>{item === "student" ? <GraduationCap className="h-4 w-4" /> : <BookOpen className="h-4 w-4" />}</span>{item}</button>)}</div></div>
              {mode === "signup" && role === "student" && <div className="rounded-2xl border border-primary/15 bg-primary/5 p-4"><div className="space-y-2"><Label htmlFor="course" className="font-semibold">Enrolled course</Label><select id="course" value={course} onChange={(event) => setCourse(event.target.value)} className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm">{courses.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></div><p className="mt-3 text-xs text-muted-foreground">This course is permanently assigned to your student profile and controls which tests you can access.</p></div>}
              {error && <p className="rounded-xl bg-red-50 px-3 py-2.5 text-sm font-medium text-red-600">{error}</p>}
              {notice && <p className="rounded-xl bg-emerald-50 px-3 py-2.5 text-sm font-medium text-emerald-600">{notice}</p>}
              <Button type="submit" size="lg" className="mt-2 h-11 w-full gap-2 shadow-lg shadow-primary/20">{mode === "login" ? <LogIn className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}{mode === "login" ? "Log in to COGNIX" : "Create local account"}</Button>
            </form>
            <p className="mt-5 text-center text-xs leading-relaxed text-muted-foreground"><ShieldCheck className="mr-1 inline h-3.5 w-3.5 text-amber-500" />Local demo only. No data leaves this browser.</p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
