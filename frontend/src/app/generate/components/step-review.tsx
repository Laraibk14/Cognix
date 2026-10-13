import React from "react";
import { Sparkles, Loader2, ChevronLeft, Copy, CalendarClock, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { FormState } from "../types";

interface StepReviewProps {
  form: FormState;
  updateForm: (updates: Partial<FormState>) => void;
  loading: boolean;
  progressValue: number;
  stageDescription?: string;
  canSubmit: boolean;
  onGenerate: () => void;
  onBack: () => void;
}

export const StepReview: React.FC<StepReviewProps> = ({
  form,
  updateForm,
  loading,
  progressValue,
  stageDescription,
  canSubmit,
  onGenerate,
  onBack,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Publish &amp; Generate Student Session
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Review the assessment, then publish a live attempt window with AI feedback enabled.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Paper Details</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subject:</span>
                <span className="font-medium">{form.subject}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Marks:</span>
                <span className="font-medium">{form.total_marks}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duration:</span>
                <span className="font-medium">{form.duration_minutes} minutes</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pattern:</span>
                <span className="font-medium">{form.exam_pattern}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Syllabus Overview</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Units:</span>
                <span className="font-medium">{form.units.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Topics:</span>
                <span className="font-medium">{form.topics.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Keywords:</span>
                <span className="font-medium">{form.keywords.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Difficulty:</span>
                <span className="font-medium">
                  {form.difficulty_distribution.easy}% Easy / {form.difficulty_distribution.medium}% Medium / {form.difficulty_distribution.hard}% Hard
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4 md:grid-cols-3">
          <div className="md:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">Live student session</p>
            <div className="mt-2 flex items-center gap-2">
              <span className="rounded-md bg-background px-3 py-2 font-mono text-lg font-bold tracking-[0.2em]">{form.session_code || "AWS-4821"}</span>
              <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={() => navigator.clipboard?.writeText(form.session_code || "AWS-4821")}><Copy className="h-3.5 w-3.5" /> Copy code</Button>
            </div>
            <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground"><Link2 className="h-3 w-3" /> cognix.local/session/{form.session_code || "AWS-4821"}</p>
          </div>
          <div className="flex flex-col justify-center gap-2 text-sm">
            <label className="flex items-center gap-2 font-medium"><input type="checkbox" checked={form.schedule_enabled} onChange={(e) => updateForm({ schedule_enabled: e.target.checked })} className="h-4 w-4 accent-primary" /> Schedule attempt window</label>
            {form.schedule_enabled && <span className="flex items-center gap-1 text-xs text-muted-foreground"><CalendarClock className="h-3.5 w-3.5" /> {form.schedule_window}</span>}
          </div>
        </div>

        {/* Units Preview */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm">Units & Topics</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {form.units.map((unit, index) => (
              <div key={index} className="p-2 bg-muted/50 rounded text-sm">
                <div className="font-medium text-xs mb-1">{unit.title}</div>
                <div className="text-xs text-muted-foreground">
                  {unit.topics.slice(0, 3).join(", ")}
                  {unit.topics.length > 3 && `... +${unit.topics.length - 3} more`}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Progress Bar */}
        {loading && (
          <div className="space-y-2 p-3.5 rounded-xl bg-slate-900/50 border border-slate-800">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-foreground flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-indigo-500 animate-ping" />
                Publishing assessment &amp; preparing feedback loop
              </span>
              <span className="font-mono text-xs text-indigo-400 font-bold">{progressValue}%</span>
            </div>
            <Progress value={progressValue} className="w-full h-2" />
            {stageDescription && (
              <p className="text-xs text-muted-foreground font-mono transition-all">
                {stageDescription}
              </p>
            )}
          </div>
        )}

        {/* Generate Button */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={onBack} className="gap-2">
            <ChevronLeft className="h-4 w-4" /> Back
          </Button>
          <Button
            onClick={onGenerate}
            disabled={!canSubmit || loading}
            className="gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Publish Session &amp; Generate Assessment
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
