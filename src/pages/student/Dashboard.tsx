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
import { useAuth } from "@/hooks/useAuth";
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
                recentActivity.map((activity: any) => (
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
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || "",
    studentId: "",
    cgpa: "",
    department: "",
    level: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const mutation = trpc.student.createProfile.useMutation({
    onSuccess: () => {
      toast.success("🎉 Profile created! Welcome to SuperMatch.");
      onCreated();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create profile");
    },
  });

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Full name is required";
    if (!formData.studentId.trim()) newErrors.studentId = "Student ID is required";
    const cgpaVal = parseFloat(formData.cgpa);
    if (!formData.cgpa || isNaN(cgpaVal) || cgpaVal < 0 || cgpaVal > 4.0)
      newErrors.cgpa = "CGPA must be between 0.00 and 4.00";
    if (!formData.department) newErrors.department = "Please select a department";
    if (!formData.level) newErrors.level = "Please select your level";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    mutation.mutate({
      name: formData.name,
      studentId: formData.studentId,
      cgpa: parseFloat(formData.cgpa),
      department: formData.department,
      level: formData.level,
    });
  };

  const departments = [
    "Computer Science",
    "Software Engineering",
    "Information Technology",
    "Electrical Engineering",
    "Mechanical Engineering",
    "Civil Engineering",
    "Chemical Engineering",
    "Mathematics",
    "Physics",
    "Statistics",
    "Biochemistry",
    "Microbiology",
    "Economics",
    "Business Administration",
    "Accounting",
  ];

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg">
        {/* Welcome Banner */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 mb-4 shadow-lg shadow-indigo-200">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome{user?.name ? `, ${user.name.split(" ")[0]}` : ""}! 👋
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Set up your student profile to get started with SuperMatch
          </p>
        </div>

        <Card className="border-slate-200 shadow-md">
          <CardHeader className="pb-4 border-b border-slate-100">
            <CardTitle className="text-base font-semibold text-slate-800">
              Complete Your Profile
            </CardTitle>
            <CardDescription>
              This information helps us match you with the right supervisor.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name */}
              <div className="space-y-1.5">
                <Label htmlFor="cp-name" className="text-sm font-medium text-slate-700">
                  Full Name
                </Label>
                <Input
                  id="cp-name"
                  placeholder="e.g. John Adebayo"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={errors.name ? "border-red-400 focus-visible:ring-red-300" : ""}
                />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>

              {/* Student ID */}
              <div className="space-y-1.5">
                <Label htmlFor="cp-studentId" className="text-sm font-medium text-slate-700">
                  Student ID / Matric Number
                </Label>
                <Input
                  id="cp-studentId"
                  placeholder="e.g. 20/ENG/CS/001"
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  className={errors.studentId ? "border-red-400 focus-visible:ring-red-300" : ""}
                />
                {errors.studentId && <p className="text-xs text-red-500 mt-1">{errors.studentId}</p>}
              </div>

              {/* Department + Level side by side */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="cp-department" className="text-sm font-medium text-slate-700">
                    Department
                  </Label>
                  <Select
                    value={formData.department}
                    onValueChange={(val) => setFormData({ ...formData, department: val })}
                  >
                    <SelectTrigger
                      id="cp-department"
                      className={`w-full ${errors.department ? "border-red-400" : ""}`}
                    >
                      <SelectValue placeholder="Select dept." />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((d) => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.department && <p className="text-xs text-red-500 mt-1">{errors.department}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="cp-level" className="text-sm font-medium text-slate-700">
                    Level
                  </Label>
                  <Select
                    value={formData.level}
                    onValueChange={(val) => setFormData({ ...formData, level: val })}
                  >
                    <SelectTrigger
                      id="cp-level"
                      className={`w-full ${errors.level ? "border-red-400" : ""}`}
                    >
                      <SelectValue placeholder="Level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="100">100 Level</SelectItem>
                      <SelectItem value="200">200 Level</SelectItem>
                      <SelectItem value="300">300 Level</SelectItem>
                      <SelectItem value="400">400 Level</SelectItem>
                      <SelectItem value="500">500 Level</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.level && <p className="text-xs text-red-500 mt-1">{errors.level}</p>}
                </div>
              </div>

              {/* CGPA */}
              <div className="space-y-1.5">
                <Label htmlFor="cp-cgpa" className="text-sm font-medium text-slate-700">
                  Current CGPA
                  <span className="ml-1 text-xs font-normal text-slate-400">(out of 4.00)</span>
                </Label>
                <Input
                  id="cp-cgpa"
                  type="number"
                  step="0.01"
                  min="0"
                  max="4.0"
                  placeholder="e.g. 3.75"
                  value={formData.cgpa}
                  onChange={(e) => setFormData({ ...formData, cgpa: e.target.value })}
                  className={errors.cgpa ? "border-red-400 focus-visible:ring-red-300" : ""}
                />
                {errors.cgpa && <p className="text-xs text-red-500 mt-1">{errors.cgpa}</p>}
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-medium mt-2"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Setting up your dashboard...
                  </span>
                ) : (
                  "Create My Dashboard"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-slate-400 mt-4">
          You can update your profile details later from your dashboard settings.
        </p>
      </div>
    </div>
  );
}
