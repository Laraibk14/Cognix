import React from "react";
import { FileText, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { examPatterns } from "../constants";
import { FormState } from "../types";

interface StepPatternProps {
  form: FormState;
  updateForm: (updates: Partial<FormState>) => void;
  onNext: () => void;
  onBack: () => void;
}

export const StepPattern: React.FC<StepPatternProps> = ({
  form,
  updateForm,
  onNext,
  onBack,
}) => {
  const canProceed = form.exam_pattern.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Assessment Pattern &amp; Question Mix
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Pattern Type Selection */}
        <div className="space-y-4">
          <Label>Choose Exam Pattern</Label>
          <div className="grid gap-3">
            {examPatterns.map((pattern) => (
              <Card
                key={pattern.value}
                className={`cursor-pointer transition-all duration-200 ${
                  form.pattern_type === pattern.value
                    ? "ring-2 ring-primary border-primary"
                    : "hover:border-primary/50"
                }`}
                onClick={() =>
                  updateForm({
                    pattern_type: pattern.value,
                    exam_pattern: pattern.value,
                  })
                }
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold">{pattern.label}</h4>
                      <p className="text-sm text-muted-foreground">{pattern.description}</p>
                    </div>

                    <div className="space-y-4 rounded-lg border bg-muted/30 p-4">
                      <div>
                        <Label>Cognitive Mix</Label>
                        <p className="mt-1 text-xs text-muted-foreground">Balance conceptual understanding with applied, scenario-based questions.</p>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm"><Label>Conceptual questions</Label><span className="font-semibold text-primary">{form.conceptual_percentage}%</span></div>
                          <input type="range" min="0" max="100" value={form.conceptual_percentage} onChange={(e) => updateForm({ conceptual_percentage: Number(e.target.value), applied_percentage: 100 - Number(e.target.value) })} className="w-full accent-primary" />
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm"><Label>Applied questions</Label><span className="font-semibold text-cyan-600">{form.applied_percentage}%</span></div>
                          <input type="range" min="0" max="100" value={form.applied_percentage} onChange={(e) => updateForm({ applied_percentage: Number(e.target.value), conceptual_percentage: 100 - Number(e.target.value) })} className="w-full accent-cyan-500" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Question types for student attempts</Label>
                        <div className="flex flex-wrap gap-2">
                          {[["mcq", "MCQs"], ["short_answer", "Short Answer"], ["coding", "Coding / Subjective"]].map(([value, label]) => {
                            const selected = form.question_types.includes(value);
                            return <button key={value} type="button" onClick={() => updateForm({ question_types: selected ? form.question_types.filter((item) => item !== value) : [...form.question_types, value] })} className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-medium transition-colors ${selected ? "border-primary bg-primary/10 text-primary" : "bg-background text-muted-foreground hover:border-primary/50"}`}>{selected && <Check className="h-3.5 w-3.5" />}{label}</button>;
                          })}
                        </div>
                        <p className="text-xs text-muted-foreground">Coding and subjective responses can be evaluated semantically by AI.</p>
                      </div>
                    </div>
                    <div className="w-4 h-4 rounded-full border-2 border-primary flex items-center justify-center">
                      {form.pattern_type === pattern.value && (
                        <div className="w-2 h-2 rounded-full bg-primary" />
                      )}
                    </div>
                  </div>

                  {pattern.value === "certification" && (
                    <div className="bg-muted/50 rounded p-3">
                      <h5 className="text-xs font-semibold mb-2">Certification Exam Pattern Structure:</h5>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="font-medium">Short Questions:</span>
                          <span>5 questions × 2 marks = 10 marks</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Long Questions:</span>
                          <span>8 questions × 15 marks = 60 marks</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Total:</span>
                          <span className="font-bold">70 marks</span>
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground">
                          <p>• Attempt 1 question per domain (4 domains)</p>
                          <p>• Short questions: Generate 7, attempt any 5</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {pattern.value === "custom" && (
                    <div className="bg-muted/50 rounded p-3">
                      <p className="text-xs text-muted-foreground">
                        Design your own paper structure with custom sections, marks distribution, and question types.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={onBack} className="gap-2">
            <ChevronLeft className="h-4 w-4" /> Back
          </Button>
          <Button onClick={onNext} disabled={!canProceed} className="gap-2">
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
