"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Clock3, FileText, LockKeyhole, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api, type Assessment, type GeneratedPaper } from "@/lib/api";
import { courses } from "@/lib/courses";

type Session = { email: string; role: "student" | "teacher"; enrollments?: { course: string; course_name?: string }[] };

export default function AttemptTestsPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [attemptedAssessmentIds, setAttemptedAssessmentIds] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<Assessment | null>(null);
  const [paper, setPaper] = useState<GeneratedPaper | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem("preppilot-session") || "null") as Session | null;
      setSession(saved);
      if (saved?.email) {
        Promise.all([api.getStudentAssessments(saved.email), api.getStudentAttempts(saved.email)])
          .then(([availableAssessments, attempts]) => {
            setAttemptedAssessmentIds(new Set(attempts.map((attempt) => attempt.assessment_id)));
            setAssessments(availableAssessments);
          })
          .catch(() => toast.error("Could not load your assessments."));
      }
    } catch {
      setSession(null);
    }
  }, []);

  const courseNames = useMemo(() => (session?.enrollments || []).map((item) =>
    item.course_name || courses.find((course) => course.id === item.course)?.name || item.course
  ), [session]);

  async function startAssessment(assessment: Assessment) {
    setSelected(assessment);
    setLoading(true);
    try {
      setPaper(await api.getPaper(assessment.paper_id));
      setAnswers({});
      setSubmitted(false);
    } catch {
      toast.error("This assessment is no longer available. Ask your teacher to publish it again.");
      setSelected(null);
    } finally {
      setLoading(false);
    }
  }

  function submitAttempt() {
    if (!selected || !paper || !session) return;
    const answered = Object.values(answers).filter((answer) => answer.trim()).length;
    api.submitStudentAttempt({
      id: `${selected.id}-${session.email}`,
      assessment_id: selected.id,
      paper_id: selected.paper_id,
      student_email: session.email,
      subject_name: selected.subject_name,
      answers,
      submitted_at: new Date().toISOString(),
      answered,
      total_questions: paper.questions.length,
      status: "awaiting_feedback",
    }).then(() => api.gradeTeacherAttempt(`${selected.id}-${session.email}`)).then(() => {
      setSubmitted(true);
      toast.success("Attempt submitted and graded. Your results are ready.");
    }).catch((err) => toast.error(err instanceof Error ? err.message : "Could not submit attempt."));
  }

  if (!session || session.role !== "student") {
    return <main className="container mx-auto max-w-3xl px-4 py-16"><Card><CardContent className="p-8 text-center"><LockKeyhole className="mx-auto h-10 w-10 text-primary" /><h1 className="mt-4 text-2xl font-black">Student sign-in required</h1><p className="mt-2 text-muted-foreground">Create or sign in to a student account to access enrolled assessments.</p></CardContent></Card></main>;
  }

  if (selected && paper) {
    if (submitted) {
      return       <main className="container mx-auto max-w-3xl px-4 py-16"><Card><CardContent className="p-8 text-center"><CheckCircle2 className="mx-auto h-14 w-14 text-emerald-500" /><h1 className="mt-4 text-3xl font-black">Attempt submitted</h1><p className="mt-2 text-muted-foreground">Your responses for {selected.subject_name} are saved and awaiting teacher feedback.</p><Button className="mt-6" onClick={() => { setSelected(null); setPaper(null); }}>Back to assessments</Button></CardContent></Card></main>;
    }
    return <main className="container mx-auto max-w-4xl space-y-6 px-4 py-10">
      <Button variant="ghost" onClick={() => setSelected(null)} className="gap-2"><ArrowLeft className="h-4 w-4" /> Available assessments</Button>
      <Card><CardHeader><p className="text-xs font-bold uppercase tracking-widest text-primary">{selected.session_code}</p><CardTitle className="text-3xl">{selected.title}</CardTitle><p className="text-muted-foreground">{paper.subject} · {paper.duration_minutes} minutes · {paper.total_marks} marks · {paper.questions.length} questions</p></CardHeader></Card>
      <div className="space-y-4">{paper.questions.map((question, index) => <Card key={question.id}><CardContent className="space-y-3 p-6"><p className="font-bold">{index + 1}. {question.text}</p><p className="text-xs text-muted-foreground">{question.marks} marks · {question.question_type}</p><textarea value={answers[question.id] || ""} onChange={(event) => setAnswers((current) => ({ ...current, [question.id]: event.target.value }))} placeholder="Write your answer here..." className="min-h-28 w-full resize-y rounded-xl border border-input bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring/30" /></CardContent></Card>)}</div>
      <div className="flex justify-end"><Button size="lg" onClick={submitAttempt} className="gap-2"><Send className="h-4 w-4" /> Submit attempt</Button></div>
    </main>;
  }

  return <main className="container mx-auto max-w-6xl space-y-8 px-4 py-10">
    <div><p className="text-xs font-bold uppercase tracking-widest text-primary">Student workspace</p><h1 className="mt-2 text-4xl font-black tracking-tight">Attempt Tests</h1><p className="mt-2 text-lg text-muted-foreground">Assessments published for your enrolled courses only.</p><div className="mt-4 flex flex-wrap gap-2">{courseNames.map((name) => <span key={name} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{name}</span>)}</div></div>
    {loading && <p className="text-muted-foreground">Loading assessment...</p>}
    {!loading && assessments.length === 0 && <Card><CardContent className="p-10 text-center"><FileText className="mx-auto h-10 w-10 text-muted-foreground" /><h2 className="mt-4 text-xl font-bold">No assessments available yet</h2><p className="mt-2 text-muted-foreground">Your teacher must publish a test for your enrolled course.</p></CardContent></Card>}
    <div className="grid gap-4 md:grid-cols-2">{assessments.map((assessment) => {
      const attempted = attemptedAssessmentIds.has(assessment.id);
      return <Card key={assessment.id} className={attempted ? "opacity-75" : undefined}><CardHeader><p className="text-xs font-bold uppercase tracking-widest text-primary">{assessment.session_code}</p><CardTitle>{assessment.title}</CardTitle></CardHeader><CardContent><p className="flex items-center gap-2 text-sm text-muted-foreground"><Clock3 className="h-4 w-4" />{assessment.subject_name}</p>{attempted ? <p className="mt-5 rounded-lg bg-emerald-500/10 px-3 py-2 text-center text-sm font-semibold text-emerald-600">Attempt submitted</p> : <Button className="mt-5 w-full gap-2" onClick={() => startAssessment(assessment)}>Start assessment <ArrowRight className="h-4 w-4" /></Button>}</CardContent></Card>;
    })}</div>
  </main>;
}
