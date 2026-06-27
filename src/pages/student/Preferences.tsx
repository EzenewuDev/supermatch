import { useState, useEffect } from "react";
import { trpc } from "@/providers/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { GraduationCap, Info, Save, RotateCcw } from "lucide-react";

export default function StudentPreferences() {
  const utils = trpc.useUtils();
  const { data, isLoading } = trpc.student.dashboard.useQuery();
  const submitMutation = trpc.student.preferences.submit.useMutation({
    onSuccess: () => {
      toast.success("Preferences saved successfully");
      utils.student.dashboard.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to save preferences");
    },
  });

  const [selections, setSelections] = useState<(number | null)[]>([
    null,
    null,
    null,
    null,
    null,
  ]);

  const supervisors = data?.supervisors || [];
  const cgpa = data?.student ? parseFloat(String(data.student.cgpa)) : 0;

  // Prefill from existing preferences
  useEffect(() => {
    if (data?.preferences && data.preferences.length > 0) {
      const newSelections: (number | null)[] = [null, null, null, null, null];
      for (const pref of data.preferences) {
        if (pref.preferenceRank >= 1 && pref.preferenceRank <= 5) {
          newSelections[pref.preferenceRank - 1] = pref.supervisorId;
        }
      }
      setSelections(newSelections);
    }
  }, [data?.preferences]);

  const handleSelect = (rank: number, supervisorId: string) => {
    const newSelections = [...selections];
    newSelections[rank - 1] = parseInt(supervisorId);
    setSelections(newSelections);
  };

  const getUsedSupervisorIds = (excludeRank: number): number[] => {
    return selections
      .map((s, i) => (i + 1 !== excludeRank ? s : null))
      .filter((s): s is number => s !== null);
  };

  const validateSelections = (): string | null => {
    const filled = selections.filter((s) => s !== null);
    if (filled.length < 3) {
      return "Please select at least 3 supervisors";
    }
    const unique = new Set(filled);
    if (unique.size !== filled.length) {
      return "Each supervisor can only be selected once";
    }
    return null;
  };

  const handleSave = () => {
    const error = validateSelections();
    if (error) {
      toast.error(error);
      return;
    }

    const prefs = selections
      .map((s, i) => (s !== null ? { supervisorId: s, rank: i + 1 } : null))
      .filter((p): p is { supervisorId: number; rank: number } => p !== null);

    submitMutation.mutate({ preferences: prefs });
  };

  const handleReset = () => {
    setSelections([null, null, null, null, null]);
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <Card className="border-slate-200">
          <CardContent className="p-6 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  const rankLabels = ["1st Choice", "2nd Choice", "3rd Choice", "4th Choice", "5th Choice"];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            My Preferences
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Rank your preferred supervisors (minimum 3)
          </p>
        </div>
        <Badge
          variant="secondary"
          className="bg-blue-50 text-blue-700 hover:bg-blue-50 text-sm px-3 py-1"
        >
          <GraduationCap className="w-4 h-4 mr-1.5" />
          CGPA: {cgpa.toFixed(2)}
        </Badge>
      </div>

      {/* Form */}
      <Card className="border-slate-200">
        <CardContent className="p-6 space-y-5">
          {rankLabels.map((label, index) => {
            const rank = index + 1;
            const usedIds = getUsedSupervisorIds(rank);
            const availableSupervisors = supervisors.filter(
              (s) => !usedIds.includes(s.id)
            );

            return (
              <div key={rank} className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  {label}
                  {rank <= 3 && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </label>
                <Select
                  value={selections[index]?.toString() || ""}
                  onValueChange={(value) => handleSelect(rank, value)}
                >
                  <SelectTrigger className="h-11 border-slate-200">
                    <SelectValue placeholder="Select a supervisor..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSupervisors.map((supervisor) => (
                      <SelectItem
                        key={supervisor.id}
                        value={supervisor.id.toString()}
                      >
                        <span className="flex items-center gap-2">
                          <span>{supervisor.name}</span>
                          <span className="text-slate-400 text-xs">
                            — {supervisor.department} ({supervisor.currentLoad}/
                            {supervisor.maxStudents})
                          </span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            );
          })}

          {/* Info note */}
          <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-100">
            <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <p className="text-sm text-blue-700">
              You may change your preferences until the administrator runs the
              allocation algorithm. Higher-ranked preferences are prioritized.
            </p>
          </div>

          {/* Error message */}
          {validateSelections() && selections.some((s) => s !== null) && (
            <p className="text-sm text-red-600">{validateSelections()}</p>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <Button
              onClick={handleSave}
              disabled={submitMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Save className="w-4 h-4 mr-2" />
              {submitMutation.isPending ? "Saving..." : "Save Preferences"}
            </Button>
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
