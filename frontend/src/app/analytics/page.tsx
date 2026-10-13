"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, BarChart3, Brain, CheckCircle2, Target, Users, type LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api, type TeacherLearningAnalytics } from "@/lib/api";

function ConceptRow({ concept, tone }: { concept: TeacherLearningAnalytics["concepts"][number]; tone: "strong" | "developing" | "weak" }) {
  const color = tone === "strong" ? "text-emerald-600" : tone === "developing" ? "text-blue-600" : "text-amber-600";
  const bar = tone === "strong" ? "bg-emerald-500" : tone === "developing" ? "bg-blue-500" : "bg-amber-500";
  return <div className="space-y-2 rounded-xl border p-4">
    <div className="flex items-start justify-between gap-4">
      <div><p className="font-semibold">{concept.concept}</p><p className="mt-1 text-xs text-muted-foreground">{concept.students} student{concept.students === 1 ? "" : "s"} · {concept.attempts} graded answer{concept.attempts === 1 ? "" : "s"}</p></div>
      <span className={`shrink-0 text-lg font-black ${color}`}>{concept.accuracy}%</span>
    </div>
    <div className="h-2.5 overflow-hidden rounded-full bg-muted"><div className={`h-full rounded-full ${bar}`} style={{ width: `${concept.accuracy}%` }} /></div>
    <p className="text-xs text-muted-foreground">{concept.correct} demonstrating understanding · {concept.incorrect} needing improvement</p>
  </div>;
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<TeacherLearningAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getTeacherLearningAnalytics()
      .then(setAnalytics)
      .catch((error) => toast.error(error instanceof Error ? error.message : "Could not load learning analytics."))
      .finally(() => setLoading(false));
  }, []);

  const data = analytics || { evaluated_attempts: 0, concepts: [], strong_concepts: [], developing_concepts: [], needs_attention: [] };
  const gradedAnswers = data.concepts.reduce((sum, concept) => sum + concept.attempts, 0);
  const averageAccuracy = gradedAnswers ? Math.round(data.concepts.reduce((sum, concept) => sum + concept.accuracy * concept.attempts, 0) / gradedAnswers) : 0;
  const stats: Array<[string, string | number, LucideIcon]> = [
    ["Evaluated tests", data.evaluated_attempts, Users],
    ["Concepts analysed", data.concepts.length, Brain],
    ["Average concept accuracy", `${averageAccuracy}%`, Target],
    ["Answers graded", gradedAnswers, CheckCircle2],
  ];

  return <main className="container mx-auto max-w-6xl space-y-8 px-4 py-10">
    <div><p className="text-xs font-bold uppercase tracking-widest text-primary">Teacher workspace</p><h1 className="mt-2 flex items-center gap-2 text-4xl font-black tracking-tight"><BarChart3 className="h-8 w-8 text-primary" />AI Learning Analytics</h1><p className="mt-2 text-lg text-muted-foreground">Concept mastery is calculated from the saved AI grades for every submitted answer.</p></div>
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{stats.map(([label, value, Icon]) => <Card key={label}><CardContent className="p-6"><Icon className="h-5 w-5 text-primary/70" /><p className="mt-4 text-sm text-muted-foreground">{label}</p><p className="mt-1 text-4xl font-black">{loading ? "—" : value}</p></CardContent></Card>)}</div>
    {!loading && data.evaluated_attempts === 0 && <Card><CardContent className="p-12 text-center"><Brain className="mx-auto h-12 w-12 text-muted-foreground" /><h2 className="mt-4 text-2xl font-bold">No AI analytics yet</h2><p className="mx-auto mt-2 max-w-xl text-muted-foreground">Generate a test, have an enrolled student submit it, and the automatic grading results will appear here by concept.</p></CardContent></Card>}
    {data.evaluated_attempts > 0 && <div className="grid gap-6 lg:grid-cols-3"><Card><CardHeader><CardTitle className="flex items-center gap-2 text-emerald-600"><CheckCircle2 className="h-5 w-5" />Strong understanding</CardTitle></CardHeader><CardContent className="space-y-3">{data.strong_concepts.length ? data.strong_concepts.map((concept) => <ConceptRow key={concept.concept} concept={concept} tone="strong" />) : <p className="py-6 text-center text-muted-foreground">No concepts have reached 70% yet.</p>}</CardContent></Card><Card><CardHeader><CardTitle className="flex items-center gap-2 text-blue-600"><Brain className="h-5 w-5" />Developing</CardTitle></CardHeader><CardContent className="space-y-3">{data.developing_concepts.length ? data.developing_concepts.map((concept) => <ConceptRow key={concept.concept} concept={concept} tone="developing" />) : <p className="py-6 text-center text-muted-foreground">No developing concepts yet.</p>}</CardContent></Card><Card><CardHeader><CardTitle className="flex items-center gap-2 text-amber-600"><AlertTriangle className="h-5 w-5" />Needs attention</CardTitle></CardHeader><CardContent className="space-y-3">{data.needs_attention.length ? data.needs_attention.map((concept) => <ConceptRow key={concept.concept} concept={concept} tone="weak" />) : <p className="py-6 text-center text-muted-foreground">No concepts currently need additional support.</p>}</CardContent></Card></div>}
  </main>;
}
