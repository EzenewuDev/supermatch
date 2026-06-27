import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Play,
  Download,
  CheckCircle,
  AlertCircle,
  GitMerge,
  TrendingUp,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export default function AdminAllocations() {
  const utils = trpc.useUtils();
  const [filter, setFilter] = useState<"all" | "allocated" | "unallocated">(
    "all"
  );
  const [showConfirm, setShowConfirm] = useState(false);

  const { data: kpis } = trpc.admin.dashboard.kpis.useQuery();
  const { data: results, isLoading: resultsLoading } =
    trpc.admin.allocate.results.useQuery({ filter });

  const runAllocation = trpc.admin.allocate.run.useMutation({
    onSuccess: (data) => {
      toast.success(
        `Allocation complete: ${data.allocated} students allocated, ${data.unallocated} unallocated (${data.executionTimeMs}ms)`
      );
      utils.admin.allocate.results.invalidate();
      utils.admin.dashboard.kpis.invalidate();
      utils.admin.dashboard.loadDistribution.invalidate();
      utils.admin.dashboard.recentAllocations.invalidate();
      setShowConfirm(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to run allocation");
      setShowConfirm(false);
    },
  });

  const handleExportCSV = async () => {
    try {
      const csvData = await utils.client.admin.allocate.export.query({
        format: "csv",
      });
      const blob = new Blob([csvData as string], {
        type: "text/csv;charset=utf-8;",
      });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `supermatch_allocations_${new Date().toISOString().split("T")[0]}.csv`;
      link.click();
      toast.success("CSV exported successfully");
    } catch {
      toast.error("Failed to export CSV");
    }
  };

  const hasAllocations = (kpis?.allocated || 0) > 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <GitMerge className="w-6 h-6 text-slate-600" />
          <h2 className="text-xl font-semibold text-slate-900">Allocations</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            disabled={!hasAllocations}
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button
            size="sm"
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => setShowConfirm(true)}
            disabled={runAllocation.isPending}
          >
            <Play className="w-4 h-4 mr-2" />
            {runAllocation.isPending ? "Running..." : "Run Allocation"}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="border-slate-200">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
                Total
              </span>
              <Users className="w-4 h-4 text-slate-400" />
            </div>
            <span className="text-2xl font-bold text-slate-900">
              {kpis?.totalStudents || 0}
            </span>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
                Allocated
              </span>
              <CheckCircle className="w-4 h-4 text-emerald-500" />
            </div>
            <span className="text-2xl font-bold text-emerald-600">
              {kpis?.allocated || 0}
            </span>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
                Unallocated
              </span>
              <AlertCircle className="w-4 h-4 text-amber-500" />
            </div>
            <span className="text-2xl font-bold text-amber-600">
              {kpis?.unallocated || 0}
            </span>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
                1st Pref Rate
              </span>
              <TrendingUp className="w-4 h-4 text-blue-500" />
            </div>
            <span className="text-2xl font-bold text-blue-600">
              {kpis?.firstPreferenceRate || 0}%
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Results */}
      {hasAllocations ? (
        <Card className="border-slate-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold text-slate-900">
                Allocation Results
              </CardTitle>
              <Tabs
                value={filter}
                onValueChange={(v) =>
                  setFilter(v as "all" | "allocated" | "unallocated")
                }
              >
                <TabsList className="h-8">
                  <TabsTrigger value="all" className="text-xs px-3">
                    All
                  </TabsTrigger>
                  <TabsTrigger value="allocated" className="text-xs px-3">
                    Allocated
                  </TabsTrigger>
                  <TabsTrigger value="unallocated" className="text-xs px-3">
                    Unallocated
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            {resultsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : results && results.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Rank
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Student
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        CGPA
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Supervisor
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Match
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {results.map((result: any, index: number) => {
                      const isUnallocated =
                        result.status === "unallocated" || !result.supervisorName;
                      return (
                        <tr
                          key={index}
                          className="hover:bg-blue-50/50 transition-colors"
                        >
                          <td className="px-4 py-3 text-sm text-slate-500 font-mono">
                            {index + 1}
                          </td>
                          <td className="px-4 py-3">
                            <div>
                              <p className="text-sm font-medium text-slate-900">
                                {result.studentName || result.name}
                              </p>
                              <p className="text-xs text-slate-500">
                                {result.studentIdCode || result.studentId}
                              </p>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600">
                            {parseFloat(String(result.cgpa)).toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600">
                            {result.supervisorName || (
                              <span className="text-slate-400 italic">
                                Not assigned
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {isUnallocated ? (
                              <Badge
                                variant="secondary"
                                className="bg-red-100 text-red-700 hover:bg-red-100 text-xs"
                              >
                                Unallocated
                              </Badge>
                            ) : (
                              <Badge
                                variant="secondary"
                                className={`text-xs ${
                                  result.preferenceRank === 1
                                    ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                                    : result.preferenceRank === 2
                                    ? "bg-blue-100 text-blue-700 hover:bg-blue-100"
                                    : "bg-slate-100 text-slate-600 hover:bg-slate-100"
                                }`}
                              >
                                {result.preferenceRank === 1
                                  ? "1st Choice"
                                  : result.preferenceRank === 2
                                  ? "2nd Choice"
                                  : result.preferenceRank === 3
                                  ? "3rd Choice"
                                  : `${result.preferenceRank}th Choice`}
                              </Badge>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <Badge
                              variant="secondary"
                              className={`text-xs ${
                                isUnallocated
                                  ? "bg-red-100 text-red-700 hover:bg-red-100"
                                  : "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                              }`}
                            >
                              {isUnallocated ? (
                                <span className="flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3" />
                                  Unallocated
                                </span>
                              ) : (
                                <span className="flex items-center gap-1">
                                  <CheckCircle className="w-3 h-3" />
                                  Allocated
                                </span>
                              )}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-slate-500">No results found</p>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        /* Empty State */
        <Card className="border-slate-200">
          <CardContent className="py-16">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4">
                <GitMerge className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                No Allocations Yet
              </h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
                Run the CGPA-based greedy allocation algorithm to assign students
                to supervisors based on their ranked preferences.
              </p>
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => setShowConfirm(true)}
                disabled={runAllocation.isPending}
              >
                <Play className="w-4 h-4 mr-2" />
                {runAllocation.isPending
                  ? "Processing..."
                  : "Run Allocation Algorithm"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Run Allocation Algorithm</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              This will execute the CGPA-based greedy matching algorithm:
            </p>
            <ol className="text-sm text-slate-600 list-decimal list-inside space-y-1">
              <li>Sort all students by CGPA (highest first)</li>
              <li>For each student, try their ranked preferences</li>
              <li>Assign to first supervisor with available capacity</li>
            </ol>
            {hasAllocations && (
              <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
                <AlertCircle className="w-4 h-4 inline mr-1" />
                Existing allocations will be overwritten.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirm(false)}>
              Cancel
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => runAllocation.mutate()}
              disabled={runAllocation.isPending}
            >
              {runAllocation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Confirm Run
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Icon components for summary cards
function Users(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
