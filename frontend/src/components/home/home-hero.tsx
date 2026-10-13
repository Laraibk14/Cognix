import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Brain,
  Check,
  ChevronRight,
  CircleHelp,
  Database,
  GraduationCap,
  LineChart,
  Network,
  Sparkles,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const flow = [
  { number: "1.", role: "TEACHER", title: "Define", detail: "Topic/Syllabus", tone: "purple" },
  { number: "2.", role: "AI", title: "Generate Quiz", detail: "& Rubrics", tone: "cyan" },
  { number: "3.", role: "STUDENT", title: "Attempt", detail: "Assessment", tone: "purple" },
  { number: "4.", role: "AI", title: "Evaluate & Grade", detail: "Submissions", tone: "cyan" },
  { number: "5.", role: "AI", title: "Pinpoint", detail: "Learning Gaps", tone: "cyan" },
  { number: "6.", role: "TEACHER/STUDENT", title: "View Feedback", detail: "& Analytics", tone: "purple" },
];

const stats = [
  { label: "Weekly Mastery Progress", value: "88%", icon: LineChart },
  { label: "Active Learners", value: "1,500+", icon: Users },
  { label: "Skills Identified", value: "210 Concepts", icon: Brain },
  { label: "AI Intelligence", value: "Grading & Diagnosis: T5+BERT", icon: Sparkles },
];

const heatmap = [
  ["#193c63", "#2f9e91", "#55c67b", "#9dd34f", "#e8c14e", "#52bd82", "#287b73"],
  ["#2a7183", "#46bd80", "#77cc65", "#d2d950", "#4dc184", "#297a78", "#1a3d63"],
  ["#367f7f", "#64c967", "#d8d44d", "#f09b53", "#46bd80", "#287371", "#2b5777"],
  ["#2b6881", "#3dba7b", "#78cf63", "#4dbe7d", "#dfd04e", "#4cae7a", "#1d4669"],
  ["#214d70", "#48b77c", "#9ace58", "#dfe053", "#2f9f83", "#28746f", "#244c6c"],
];

function MiniHeatmap({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`grid ${compact ? "grid-cols-5" : "grid-cols-7"} gap-1`}>
      {(compact ? heatmap.slice(0, 4).map((row) => row.slice(0, 5)) : heatmap).flat().map((color, index) => (
        <span key={`${color}-${index}`} className="aspect-square rounded-[2px]" style={{ backgroundColor: color }} />
      ))}
    </div>
  );
}

function DashboardPreview({ student = false }: { student?: boolean }) {
  return (
    <div className="flex min-h-[150px] overflow-hidden rounded-md border border-[#29374a] bg-[#0e1724] text-[7px] text-slate-400">
      <div className="w-[27%] border-r border-[#29374a] bg-[#0a1320] p-2">
        <div className="mb-3 flex items-center gap-1 font-semibold text-slate-200"><div className="h-3 w-3 rounded bg-[#4f60d9]" />{student ? "Student" : "Teacher"} Hub</div>
        {["Dashboard", "Skills", "Performance", "Reports", "Settings"].map((item, index) => (
          <div key={item} className={`mb-2 rounded px-1.5 py-1 ${index === 0 ? "bg-[#283452] text-cyan-300" : ""}`}>{item}</div>
        ))}
      </div>
      <div className="flex-1 space-y-3 p-2.5">
        <div className="flex items-center justify-between"><span className="font-semibold text-slate-200">{student ? "Personalized Gap Analysis" : "Class Heatmap"}</span><span className="rounded bg-[#1f2c3d] px-1.5 py-1">Last 30 days⌄</span></div>
        <div className="grid grid-cols-3 gap-1.5">
          {(student ? ["7 gaps", "0 gaps", "15"] : ["24 learners", "82% avg", "6 classes"]).map((item) => <div key={item} className="rounded border border-[#26364a] bg-[#172333] p-1.5 text-center font-semibold text-slate-200">{item}</div>)}
        </div>
        <MiniHeatmap compact={student} />
      </div>
    </div>
  );
}

export const HomeHero: React.FC = () => {
  return (
    <div className="home-dashboard min-h-[calc(100vh-5rem)]">
      <section className="border-b border-border px-4 pb-12 pt-12 md:pb-14 md:pt-16">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-cyan-500">The intelligent learning operating system</p>
            <h1 className="text-4xl font-extrabold tracking-tight md:text-6xl">
              COGNIX: AI-Powered Learning Mastery
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
              Turn Quizzes into Outcomes—Evaluate, Diagnose, and Close Learning Gaps <br className="hidden md:block" /> in Minutes, not Days. <br className="hidden md:block" /> Powered by Advanced T5 &amp; Sentence-BERT.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              <Link href="/generate"><Button size="lg" className="gap-2 px-6 text-sm shadow-lg shadow-primary/20"><GraduationCap className="h-4 w-4" />Create &amp; Publish Assessment</Button></Link>
              <Link href="/question-bank"><Button size="lg" variant="outline" className="gap-2 px-6 text-sm"><CircleHelp className="h-4 w-4" />Attempt &amp; View Feedback</Button></Link>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="mb-5 text-center text-2xl font-bold md:text-3xl">Your Closed-Loop Feedback Flow</h2>
            <div className="flex flex-col items-stretch gap-1 md:flex-row md:items-center md:justify-center md:gap-1">
              {flow.map((step, index) => (
                <React.Fragment key={step.number}>
                  <div className={`flex min-h-[61px] flex-1 flex-col justify-center rounded-md border px-2 text-center ${step.tone === "cyan" ? "border-cyan-500/70 bg-cyan-500/10" : "border-indigo-400/70 bg-indigo-500/10"}`}>
                    <span className="text-[9px] font-medium text-slate-300">{step.number} {step.role}</span>
                    <span className="mt-1 text-xs font-semibold text-slate-100">{step.title}</span>
                    <span className="text-[11px] text-slate-300">{step.detail}</span>
                  </div>
                  {index < flow.length - 1 && <ChevronRight className="mx-auto hidden h-4 w-4 shrink-0 text-cyan-300 md:block" />}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-7">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400">Your learning hub</p>
        <div className="grid gap-2 md:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return <div key={stat.label} className="flex min-h-[58px] items-center justify-between rounded-md border border-[#293847] bg-[#18212b] px-3 py-2.5"><div><p className="text-[10px] text-slate-400">{stat.label}</p><p className="mt-0.5 text-sm font-bold text-slate-100">{stat.value}</p></div><Icon className="h-5 w-5 text-cyan-300" /></div>;
          })}
        </div>

        <div className="mt-3 grid gap-3 lg:grid-cols-2">
          <div className="rounded-md border border-[#293847] bg-[#18212b] p-2">
            <div className="mb-2 flex items-center justify-between px-1"><h3 className="text-xs font-bold text-slate-100">Teacher Overview</h3><div className="flex gap-2 text-slate-500"><Network className="h-3 w-3" /><Users className="h-3 w-3" /></div></div>
            <DashboardPreview />
          </div>
          <div className="rounded-md border border-[#293847] bg-[#18212b] p-2">
            <div className="mb-2 flex items-center justify-between px-1"><h3 className="text-xs font-bold text-slate-100">Student Dashboard</h3><div className="flex gap-2 text-slate-500"><Database className="h-3 w-3" /><Sparkles className="h-3 w-3" /></div></div>
            <DashboardPreview student />
          </div>
        </div>

        <div className="mt-7 grid gap-4 rounded-md border border-[#293847] bg-[#18212b] p-4 md:grid-cols-[1fr_1.6fr] md:p-5">
          <div className="flex flex-col justify-center">
            <p className="mb-1 flex items-center gap-2 text-xs font-semibold text-cyan-300"><BarChart3 className="h-4 w-4" /> Insights that move learning forward</p>
            <h2 className="text-lg font-bold text-slate-100 md:text-xl">Real-time Analytics</h2>
            <p className="mt-1 max-w-sm text-xs leading-relaxed text-slate-400">Interactive charts of interactive 1 subject mastery, and remedial actions. Learn more.</p>
            <Link href="/analytics" className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-cyan-300 hover:text-cyan-200">Open analytics <ArrowRight className="h-3.5 w-3.5" /></Link>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[["Subject Mastery", "62", "78", "48", "88", "68"], ["Subject Mastery", "42", "67", "84", "58", "77"]].map(([title, ...values], index) => (
              <div key={`${title}-${index}`} className="rounded border border-[#293847] bg-[#101a26] p-3"><div className="mb-3 flex items-center justify-between text-[9px] font-semibold text-slate-200"><span>{title}</span><span className="text-slate-500">Last 6 months</span></div><div className="flex h-24 items-end justify-around gap-1 border-b border-l border-[#354453] px-2 pb-0">{values.map((value, barIndex) => <div key={value + barIndex} className="flex h-full items-end gap-0.5"><span className="w-1.5 bg-indigo-400" style={{ height: `${value}%` }} /><span className="w-1.5 bg-cyan-300" style={{ height: `${Math.max(20, Number(value) - 18)}%` }} /></div>)}</div><div className="mt-1 flex justify-around text-[8px] text-slate-500"><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span></div></div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-4 text-[10px] text-slate-500"><span className="flex items-center gap-1"><Check className="h-3 w-3 text-cyan-300" />Closed-loop feedback</span><span className="flex items-center gap-1"><Check className="h-3 w-3 text-cyan-300" />Teacher-ready assessments</span><span className="flex items-center gap-1"><Check className="h-3 w-3 text-cyan-300" />Student-first insights</span></div>
      </section>
    </div>
  );
};
