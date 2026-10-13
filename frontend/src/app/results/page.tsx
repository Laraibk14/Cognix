"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, CheckCircle2, Clock3, LineChart, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api, type Attempt } from "@/lib/api";

export default function ResultsPage() {
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [studentEmail] = useState(() => {
    if (typeof window === "undefined") return "";
    try {
      return (JSON.parse(window.localStorage.getItem("preppilot-session") || "null") as { email?: string } | null)?.email || "";
    } catch {
      return "";
    }
  });

  function loadAttempts(email: string) {
    setLoading(true);
    api.getStudentAttempts(email).then(setAttempts).catch(() => setAttempts([])).finally(() => setLoading(false));
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (studentEmail) loadAttempts(studentEmail);
      else setLoading(false);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [studentEmail]);

  return <main className="container mx-auto max-w-6xl space-y-8 px-4 py-10">
    <div><p className="text-xs font-bold uppercase tracking-widest text-primary">Student workspace</p><h1 className="mt-2 text-4xl font-black tracking-tight">Results &amp; Feedback</h1><p className="mt-2 text-lg text-muted-foreground">Your submitted attempts and teacher feedback in one place.</p></div>
    <div className="grid gap-4 md:grid-cols-3"><Card><CardContent className="p-6"><p className="text-sm text-muted-foreground">Tests submitted</p><p className="mt-2 text-4xl font-black text-primary">{attempts.length}</p><p className="mt-1 flex items-center gap-1 text-xs text-emerald-600"><ArrowUpRight className="h-3.5 w-3.5" />Saved in database</p></CardContent></Card><Card><CardContent className="p-6"><p className="text-sm text-muted-foreground">Results available</p><p className="mt-2 text-4xl font-black">{attempts.filter((attempt) => attempt.status === "evaluated").length}</p><p className="mt-1 text-xs text-muted-foreground">AI graded submissions</p></CardContent></Card><Card><CardContent className="p-6"><p className="text-sm text-muted-foreground">Questions answered</p><p className="mt-2 text-4xl font-black">{attempts.reduce((sum, attempt) => sum + attempt.answered, 0)}</p><p className="mt-1 text-xs text-muted-foreground">Across submitted tests</p></CardContent></Card></div>
    <Card><CardHeader><CardTitle className="flex items-center justify-between gap-2"><span className="flex items-center gap-2"><LineChart className="h-5 w-5 text-primary" />Recent attempts</span>{studentEmail && <Button variant="outline" size="sm" onClick={() => loadAttempts(studentEmail)} className="gap-2"><RefreshCw className="h-3.5 w-3.5" />Refresh</Button>}</CardTitle></CardHeader><CardContent className="space-y-3">{loading ? <p className="py-8 text-center text-muted-foreground">Loading results...</p> : attempts.length === 0 ? <p className="py-8 text-center text-muted-foreground">Submit an assessment to see your results here.</p> : attempts.map((attempt) => { const evaluated = attempt.status === "evaluated"; const percentage = attempt.max_score ? Math.round(((attempt.total_score || 0) / attempt.max_score) * 100) : 0; return <div key={attempt.id} className="flex flex-wrap items-center gap-3 rounded-xl border p-4"><CheckCircle2 className={`h-5 w-5 ${evaluated ? "text-emerald-500" : "text-muted-foreground"}`} /><div><p className="font-semibold">{attempt.title || attempt.subject_name}</p><p className="text-xs text-muted-foreground">{attempt.answered}/{attempt.total_questions} questions answered · {new Date(attempt.submitted_at).toLocaleString()}</p></div><span className={`ml-auto flex items-center gap-2 text-sm font-semibold ${evaluated ? "text-emerald-600" : "text-muted-foreground"}`}>{evaluated ? `${attempt.total_score || 0}/${attempt.max_score || 0} (${percentage}%)` : <><Clock3 className="h-3.5 w-3.5" />Grading in progress</>}</span></div>; })}</CardContent></Card>
  </main>;
}
