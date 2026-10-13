"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, ClipboardCheck, FileText, Loader2, Save, UserRound } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api, type Attempt, type GeneratedPaper } from "@/lib/api";

export default function EvaluatePage() {
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [selected, setSelected] = useState<Attempt | null>(null);
  const [paper, setPaper] = useState<GeneratedPaper | null>(null);
  const [loading, setLoading] = useState(true);
  const [grading, setGrading] = useState(false);
  const [corrections, setCorrections] = useState<Record<string, { score: number; feedback: string }>>({});

  useEffect(() => {
    api.getTeacherAttempts()
      .then(setAttempts)
      .catch((error) => toast.error(error instanceof Error ? error.message : "Could not load submissions."))
      .finally(() => setLoading(false));
  }, []);

  async function openAttempt(attempt: Attempt) {
    setSelected(attempt);
    setCorrections({});
    setGrading(true);
    try {
      const [loadedPaper, gradedAttempt] = await Promise.all([
        api.getPaper(attempt.paper_id),
        api.gradeTeacherAttempt(attempt.id),
      ]);
      setPaper(loadedPaper);
      setSelected(gradedAttempt);
      setAttempts((items) => items.map((item) => item.id === gradedAttempt.id ? gradedAttempt : item));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not load the paper.");
    } finally {
      setGrading(false);
    }
  }

  async function autoGrade() {
    if (!selected) return;
    setGrading(true);
    try {
      const graded = await api.gradeTeacherAttempt(selected.id, corrections);
      setSelected(graded);
      setAttempts((items) => items.map((item) => item.id === graded.id ? graded : item));
      toast.success("All answers graded and saved.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Automatic grading failed.");
    } finally {
      setGrading(false);
    }
  }

  if (selected && paper) {
    return <main className="container mx-auto max-w-6xl space-y-6 px-4 py-10">
      <Button variant="ghost" onClick={() => { setSelected(null); setPaper(null); }}>← All submissions</Button>
      <Card><CardHeader><p className="text-xs font-bold uppercase tracking-widest text-primary">{selected.student_email}</p><CardTitle className="text-3xl">{selected.title || paper.subject}</CardTitle><p className="text-muted-foreground">{paper.subject} · {selected.answered}/{selected.total_questions} answered</p></CardHeader><CardContent className="flex flex-wrap items-center justify-between gap-4"><div className="text-sm text-muted-foreground">Score: <strong className="text-foreground">{selected.total_score ?? 0} / {selected.max_score ?? paper.total_marks}</strong></div><Button onClick={autoGrade} disabled={grading} className="gap-2">{grading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}{selected.status === "evaluated" ? "Re-grade and save" : "AI grade all answers"}</Button></CardContent></Card>
      <div className="space-y-4">{paper.questions.map((question, index) => {
        const evaluation = selected.evaluation?.[question.id];
        const correction = corrections[question.id];
        return <Card key={question.id}><CardContent className="space-y-4 p-6"><div className="flex items-start justify-between gap-4"><p className="font-bold">{index + 1}. {question.text}</p><span className="shrink-0 text-xs text-muted-foreground">{question.marks} marks</span></div><div className="rounded-xl bg-muted/50 p-4"><p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Student answer</p><p className="whitespace-pre-wrap text-sm">{selected.answers?.[question.id] || "No answer submitted."}</p></div>{evaluation && <div className="grid gap-4 rounded-xl border border-primary/15 bg-primary/5 p-4 md:grid-cols-[120px_1fr]"><div><label className="text-xs font-semibold text-muted-foreground">Awarded marks</label><Input type="number" min={0} max={question.marks} step="0.5" value={correction?.score ?? evaluation.score} onChange={(event) => setCorrections((items) => ({ ...items, [question.id]: { score: Number(event.target.value), feedback: correction?.feedback ?? evaluation.feedback } }))} className="mt-1" /></div><div><p className="text-xs font-semibold uppercase tracking-wide text-primary">AI feedback</p><p className="mt-1 text-sm">{correction?.feedback ?? evaluation.feedback}</p></div></div>}</CardContent></Card>;
      })}</div>
      {selected.status === "evaluated" && <Button variant="outline" onClick={autoGrade} className="gap-2"><Save className="h-4 w-4" />Save teacher corrections</Button>}
    </main>;
  }

  return <main className="container mx-auto max-w-6xl space-y-8 px-4 py-10">
    <div><p className="text-xs font-bold uppercase tracking-widest text-primary">Teacher workspace</p><h1 className="mt-2 text-4xl font-black tracking-tight">Evaluate submissions</h1><p className="mt-2 text-lg text-muted-foreground">Open a student attempt to view every answer. AI grading runs automatically and can be corrected when needed.</p></div>
    <Card><CardHeader><CardTitle className="flex items-center gap-2"><ClipboardCheck className="h-5 w-5 text-primary" />Student submissions</CardTitle></CardHeader><CardContent className="space-y-3">{loading && <p className="py-8 text-center text-muted-foreground">Loading submissions...</p>}{!loading && attempts.length === 0 && <p className="py-10 text-center text-muted-foreground">No student submissions yet. Publish a test and have an enrolled student submit it.</p>}{attempts.map((attempt) => <button type="button" key={attempt.id} onClick={() => openAttempt(attempt)} className="flex w-full items-center gap-3 rounded-xl border p-4 text-left transition hover:border-primary/50 hover:bg-primary/5"><UserRound className="h-5 w-5 text-primary" /><span className="min-w-0 flex-1"><span className="block font-semibold">{attempt.title || attempt.subject_name}</span><span className="text-xs text-muted-foreground">{attempt.student_email} · {attempt.answered}/{attempt.total_questions} answered</span></span><span className="flex items-center gap-1 text-xs font-semibold text-primary"><FileText className="h-4 w-4" />View answers</span></button>)}</CardContent></Card>
  </main>;
}
