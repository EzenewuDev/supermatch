import { trpc } from "@/providers/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  Users,
  UserCheck,
  CheckCircle,
  AlertCircle,
  Play,
  Download,
  Upload,
  GitMerge,
  TrendingUp,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useNavigate } from "react-router";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const utils = trpc.useUtils();

  const { data: kpis, isLoading: kpisLoading } =
    trpc.admin.dashboard.kpis.useQuery();
  const { data: loadDistribution, isLoading: loadLoading } =
    trpc.admin.dashboard.loadDistribution.useQuery();
  const { data: recentAllocations, isLoading: recentLoading } =
    trpc.admin.dashboard.recentAllocations.useQuery();

  const runAllocation = trpc.admin.allocate.run.useMutation({
    onSuccess: (data) => {
      toast.success(
        `Allocation complete: ${data.allocated} allocated, ${data.unallocated} unallocated in ${data.executionTimeMs}ms`
      );
      utils.admin.dashboard.kpis.invalidate();
      utils.admin.dashboard.loadDistribution.invalidate();
      utils.admin.dashboard.recentAllocations.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to run allocation");
    },
  });

  if (kpisLoading || loadLoading || recentLoading) {
    return <AdminDashboardSkeleton />;
  }

  const chartData =
    loadDistribution?.map((sup) => ({
      name: sup.name.replace("Dr. ", "").replace("Prof. ", ""),
      fullName: sup.name,
      load: sup.currentLoad,
      capacity: sup.maxStudents,
      remaining: sup.maxStudents - sup.currentLoad,
    })) || [];

  const allocationRate =
    kpis && kpis.totalStudents > 0
      ? Math.round((kpis.allocated / kpis.totalStudents) * 100)
      : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
                Total Students
              </span>
              <Users className="w-5 h-5 text-slate-400" />
            </div>
            <span className="text-3xl font-bold text-slate-900">
              {kpis?.totalStudents || 0}
            </span>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
                Allocated
              </span>
              <CheckCircle className="w-5 h-5 text-emerald-500" />
            </div>
            <span className="text-3xl font-bold text-emerald-600">
              {kpis?.allocated || 0}
            </span>
            <Progress value={allocationRate} className="h-1.5 mt-2" />
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
                Unallocated
              </span>
              <AlertCircle className="w-5 h-5 text-amber-500" />
            </div>
            <span className="text-3xl font-bold text-amber-600">
              {kpis?.unallocated || 0}
            </span>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
                Supervisors
              </span>
              <UserCheck className="w-5 h-5 text-slate-400" />
            </div>
            <span className="text-3xl font-bold text-slate-900">
              {kpis?.totalSupervisors || 0}
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Second Row: Chart + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Load Distribution Chart */}
        <Card className="lg:col-span-3 border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-slate-900">
              Supervisor Load Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={chartData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e2e8f0"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12, fill: "#64748b" }}
                    axisLine={{ stroke: "#e2e8f0" }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "#64748b" }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      fontSize: "13px",
                    }}
                    formatter={(value: number, name: string) => {
                      if (name === "load") return [`${value} students`, "Current Load"];
                      return [value, name];
                    }}
                    labelFormatter={(label: string) => {
                      const item = chartData.find((d) => d.name === label);
                      return item?.fullName || label;
                    }}
                  />
                  <Bar dataKey="load" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          entry.load >= entry.capacity
                            ? "#ef4444"
                            : entry.load > entry.capacity * 0.8
                            ? "#f59e0b"
                            : "#2563eb"
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center">
                <p className="text-sm text-slate-400">
                  No allocation data yet
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="lg:col-span-2 border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-slate-900">
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white justify-start gap-3"
              onClick={() => runAllocation.mutate()}
              disabled={runAllocation.isPending}
            >
              <Play className="w-5 h-5" />
              <span className="flex-1 text-left">
                {runAllocation.isPending
                  ? "Processing..."
                  : "Run Allocation"}
              </span>
              {runAllocation.isPending && (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
            </Button>

            <Button
              variant="outline"
              className="w-full h-12 justify-start gap-3 border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
              onClick={() => navigate("/admin/students")}
            >
              <Download className="w-5 h-5" />
              <span className="flex-1 text-left">Import Students</span>
            </Button>

            <Button
              variant="outline"
              className="w-full h-12 justify-start gap-3 border-purple-200 text-purple-700 hover:bg-purple-50 hover:text-purple-800"
              onClick={() => navigate("/admin/allocations")}
            >
              <Upload className="w-5 h-5" />
              <span className="flex-1 text-left">Export Results</span>
            </Button>

            {/* Stats */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">First Preference Rate</span>
                <span className="font-semibold text-slate-900">
                  {kpis?.firstPreferenceRate || 0}%
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Allocation Rate</span>
                <span className="font-semibold text-slate-900">
                  {allocationRate}%
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Satisfaction Target</span>
                <span className="font-semibold text-emerald-600">
                  {kpis && kpis.firstPreferenceRate >= 70
                    ? "Met"
                    : "Pending"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Allocations */}
      <Card className="border-slate-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold text-slate-900">
              Recent Allocations
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/admin/allocations")}
            >
              View All
              <TrendingUp className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {recentAllocations && recentAllocations.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
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
                  {recentAllocations.map((alloc, index) => (
                    <tr
                      key={index}
                      className="hover:bg-blue-50/50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            {alloc.studentName}
                          </p>
                          <p className="text-xs text-slate-500">
                            {alloc.studentId}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {parseFloat(String(alloc.cgpa)).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {alloc.supervisorName}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant="secondary"
                          className={`text-xs ${
                            alloc.preferenceRank === 1
                              ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                              : alloc.preferenceRank === 2
                              ? "bg-blue-100 text-blue-700 hover:bg-blue-100"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          {alloc.preferenceRank === 1
                            ? "1st"
                            : alloc.preferenceRank === 2
                            ? "2nd"
                            : `${alloc.preferenceRank}th`}{" "}
                          Choice
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant="secondary"
                          className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 text-xs"
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Allocated
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <GitMerge className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-500">
                No allocations yet. Run the allocation algorithm to get started.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function AdminDashboardSkeleton() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border-slate-200">
            <CardContent className="p-5">
              <Skeleton className="h-4 w-24 mb-3" />
              <Skeleton className="h-9 w-12" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <Card className="lg:col-span-3 border-slate-200">
          <CardHeader>
            <Skeleton className="h-5 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
        <Card className="lg:col-span-2 border-slate-200">
          <CardHeader>
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
