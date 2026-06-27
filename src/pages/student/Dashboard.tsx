import { trpc } from "@/providers/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
  GraduationCap,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowRight,
  Users,
  Activity,
  Calendar
} from "lucide-react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const utils = trpc.useUtils();
  const { data, isLoading } = trpc.student.dashboard.useQuery();

  if (isLoading) {
    return <StudentDashboardSkeleton />;
  }

  if (!data?.student) {
    return <CreateProfileForm onCreated={() => utils.student.dashboard.invalidate()} />;
  }

  const { student, preferences, supervisors, cgpaProgression, recentActivity } = data;
  const cgpa = parseFloat(String(student.cgpa));

  const statusConfig = {
    allocated: { color: "bg-emerald-100 text-emerald-700", icon: CheckCircle, label: "Allocated" },
    unallocated: { color: "bg-amber-100 text-amber-700", icon: AlertCircle, label: "Unallocated" },
    pending: { color: "bg-blue-100 text-blue-700", icon: Clock, label: "Pending" },
  };

  const status = statusConfig[student.allocationStatus as keyof typeof statusConfig] || statusConfig.pending;
  const StatusIcon = status.icon;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
                Your CGPA
              </span>
              <GraduationCap className="w-5 h-5 text-indigo-500" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-slate-900 dark:text-white">
                {cgpa.toFixed(2)}
              </span>
              <span className="text-sm text-slate-400">/ 4.0</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
                Allocation Status
              </span>
              <StatusIcon className="w-5 h-5 text-indigo-500" />
            </div>
            <Badge
              className={`${status.color} hover:${status.color} border-0 text-xs font-medium px-2.5 py-1`}
            >
              {status.label}
            </Badge>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
                Preferences
              </span>
              <Users className="w-5 h-5 text-indigo-500" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-slate-900 dark:text-white">
                {preferences?.length || 0}
              </span>
              <span className="text-sm text-slate-400">/ 5 submitted</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics and Activity Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CGPA Progression Chart */}
        <Card className="border-slate-200 shadow-sm flex flex-col">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">CGPA Progression</CardTitle>
                <CardDescription>Your academic performance over time</CardDescription>
              </div>
              <Activity className="w-5 h-5 text-indigo-400" />
            </div>
          </CardHeader>
          <CardContent className="flex-1 min-h-[250px] pt-4">
            {cgpaProgression && cgpaProgression.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={cgpaProgression} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCgpa" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="semester" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                  <YAxis domain={[1, 4]} tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ color: '#4f46e5', fontWeight: 600 }}
                  />
                  <Area type="monotone" dataKey="cgpa" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorCgpa)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-slate-500">
                No progression data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity Timeline */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-4">
             <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">Recent Activity</CardTitle>
                <CardDescription>Your latest actions and updates</CardDescription>
              </div>
              <Calendar className="w-5 h-5 text-indigo-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
              {recentActivity && recentActivity.length > 0 ? (
                recentActivity.map((activity: any, index: number) => (
                  <div key={activity.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-5 h-5 rounded-full border border-white bg-indigo-500 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10" />
                    <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.25rem)] p-4 rounded border border-slate-100 bg-slate-50 dark:bg-slate-800 dark:border-slate-700 shadow-sm">
                      <div className="flex flex-col space-y-1">
                        <span className="text-xs font-semibold text-indigo-500 uppercase">
                          {new Date(activity.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                          {activity.action}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-sm text-slate-500">No recent activity</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Two Column Layout (Original) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Preferences Summary */}
        <Card className="lg:col-span-3 border-slate-200 shadow-sm">
          <CardHeader className="pb-3 border-b border-slate-100 mb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">
                My Preferences
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                className="h-8"
                onClick={() => navigate("/student/preferences")}
              >
                Edit Preferences
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {preferences && preferences.length > 0 ? (
              <div className="space-y-3">
                {preferences.map((pref) => (
                  <div
                    key={pref.id}
                    className="flex items-center gap-4 p-3 rounded-lg bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-bold shrink-0">
                      #{pref.preferenceRank}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        {pref.supervisorName}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {pref.preferenceRank === 1 ? "Top Choice" : `${pref.preferenceRank} Choice`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                <p className="text-sm text-slate-500 mb-4">
                  You haven&apos;t submitted any preferences yet
                </p>
                <Button
                  size="sm"
                  onClick={() => navigate("/student/preferences")}
                >
                  Submit Preferences
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Available Supervisors */}
        <Card className="lg:col-span-2 border-slate-200 shadow-sm">
          <CardHeader className="pb-3 border-b border-slate-100 mb-2">
            <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">
              Available Supervisors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
              {supervisors?.map((supervisor: any) => (
                <div
                  key={supervisor.id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-700"
                >
                  <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-slate-600">
                      {supervisor.name.substring(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                      {supervisor.name}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {supervisor.department}
                    </p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-xs text-slate-400 font-medium">Capacity</span>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {supervisor.currentLoad}/{supervisor.maxStudents}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StudentDashboardSkeleton() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border-slate-200">
            <CardContent className="p-5">
              <Skeleton className="h-4 w-20 mb-3" />
              <Skeleton className="h-9 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-72 w-full rounded-xl" />
        <Skeleton className="h-72 w-full rounded-xl" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <Card className="lg:col-span-3 border-slate-200">
          <CardHeader>
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </CardContent>
        </Card>
        <Card className="lg:col-span-2 border-slate-200">
          <CardHeader>
            <Skeleton className="h-5 w-40" />
          </CardHeader>
          <CardContent className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function CreateProfileForm({ onCreated }: { onCreated: () => void }) {
  const [loading, setLoading] = useState(false);
  const mutation = trpc.student.createProfile.useMutation({
    onSuccess: () => {
      toast.success("Profile created successfully");
      onCreated();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create profile");
      setLoading(false);
    }
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    mutation.mutate({
      name: formData.get("name") as string,
      studentId: formData.get("studentId") as string,
      cgpa: parseFloat(formData.get("cgpa") as string),
      department: formData.get("department") as string,
      level: formData.get("level") as string,
    });
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <Card>
        <CardHeader>
          <CardTitle>Complete Your Profile</CardTitle>
          <CardDescription>We need some details to set up your dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" name="name" required placeholder="John Doe" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="studentId">Student ID</Label>
              <Input id="studentId" name="studentId" required placeholder="STU12345" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cgpa">Current CGPA</Label>
              <Input id="cgpa" name="cgpa" type="number" step="0.01" min="0" max="4.0" required placeholder="3.50" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select name="department" required defaultValue="Computer Science">
                <SelectTrigger>
                  <SelectValue placeholder="Select Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Computer Science">Computer Science</SelectItem>
                  <SelectItem value="Software Engineering">Software Engineering</SelectItem>
                  <SelectItem value="Information Technology">Information Technology</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="level">Level</Label>
              <Select name="level" required defaultValue="400">
                <SelectTrigger>
                  <SelectValue placeholder="Select Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="300">300 Level</SelectItem>
                  <SelectItem value="400">400 Level</SelectItem>
                  <SelectItem value="500">500 Level</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Saving..." : "Save Profile"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
