import { trpc } from "@/providers/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  UserCheck,
  TrendingUp,
  AlertCircle,
  GraduationCap,
  Settings,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { toast } from "sonner";

export default function SupervisorDashboard() {
  const { data, isLoading } = trpc.supervisor.dashboard.useQuery();

  if (isLoading) {
    return <SupervisorDashboardSkeleton />;
  }

  if (!data?.supervisor) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <p className="text-slate-500">No supervisor record found</p>
      </div>
    );
  }

  const { supervisor, assignedStudents } = data;
  const remainingSlots = supervisor.maxStudents - supervisor.currentLoad;
  const loadPercentage =
    (supervisor.currentLoad / supervisor.maxStudents) * 100;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Supervisor Info */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center">
          <span className="text-xl font-bold text-blue-700">
            {supervisor.name.charAt(0)}
          </span>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            {supervisor.name}
          </h2>
          <p className="text-sm text-slate-500">{supervisor.department}</p>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <Badge
            variant={supervisor.isAvailable ? "default" : "secondary"}
            className={
              supervisor.isAvailable
                ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                : "bg-slate-100 text-slate-600 hover:bg-slate-100"
            }
          >
            {supervisor.isAvailable ? "Available" : "Unavailable"}
          </Badge>
          <SupervisorSettingsDialog supervisor={supervisor} />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-slate-200">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
                Max Students
              </span>
              <Users className="w-5 h-5 text-slate-400" />
            </div>
            <span className="text-3xl font-bold text-slate-900">
              {supervisor.maxStudents}
            </span>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
                Assigned
              </span>
              <UserCheck className="w-5 h-5 text-slate-400" />
            </div>
            <span className="text-3xl font-bold text-slate-900">
              {supervisor.currentLoad}
            </span>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
                Remaining Slots
              </span>
              <TrendingUp className="w-5 h-5 text-slate-400" />
            </div>
            <span className="text-3xl font-bold text-slate-900">
              {remainingSlots}
            </span>
            <Progress
              value={loadPercentage}
              className="h-2 mt-3"
            />
          </CardContent>
        </Card>
      </div>

      {/* Assigned Students Table */}
      <Card className="border-slate-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-slate-900">
            Assigned Students
          </CardTitle>
        </CardHeader>
        <CardContent>
          {assignedStudents && assignedStudents.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Student ID
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      CGPA
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Level
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Matched
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {assignedStudents.map((student, index) => (
                    <tr
                      key={index}
                      className="hover:bg-blue-50/50 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {student.studentId}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-slate-900">
                        {student.name}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        <span className="inline-flex items-center gap-1">
                          <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                          {parseFloat(String(student.cgpa)).toFixed(2)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {student.department}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {student.level}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant="secondary"
                          className={`text-xs ${
                            student.preferenceRank === 1
                              ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                              : student.preferenceRank === 2
                              ? "bg-blue-100 text-blue-700 hover:bg-blue-100"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          {student.preferenceRank === 1
                            ? "1st Choice"
                            : student.preferenceRank === 2
                            ? "2nd Choice"
                            : `${student.preferenceRank}th Choice`}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <p className="text-sm text-slate-500">
                No students allocated yet
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Students will appear here after the allocation algorithm is run
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function SupervisorDashboardSkeleton() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-4">
        <Skeleton className="w-14 h-14 rounded-full" />
        <div>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-32 mt-2" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border-slate-200">
            <CardContent className="p-5">
              <Skeleton className="h-4 w-24 mb-3" />
              <Skeleton className="h-9 w-12" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="border-slate-200">
        <CardHeader>
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-40 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

function SupervisorSettingsDialog({ supervisor }: { supervisor: any }) {
  const [open, setOpen] = useState(false);
  const [maxStudents, setMaxStudents] = useState(supervisor.maxStudents);
  const [isAvailable, setIsAvailable] = useState(supervisor.isAvailable);
  const utils = trpc.useUtils();

  const updateSettings = trpc.supervisor.updateSettings.useMutation({
    onSuccess: () => {
      toast.success("Settings updated successfully");
      utils.supervisor.dashboard.invalidate();
      setOpen(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update settings");
    },
  });

  const handleSave = () => {
    updateSettings.mutate({
      maxStudents: parseInt(maxStudents, 10),
      isAvailable,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="bg-white hover:bg-slate-50 text-slate-700">
          <Settings className="w-4 h-4 mr-2 text-slate-500" />
          Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Supervisor Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base font-medium">Accepting Students</Label>
              <p className="text-sm text-slate-500">
                Toggle whether you are currently taking new students for supervision.
              </p>
            </div>
            <Switch
              checked={isAvailable}
              onCheckedChange={setIsAvailable}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="maxStudents" className="text-base font-medium">Maximum Capacity</Label>
            <p className="text-sm text-slate-500 mb-2">
              Set the maximum number of students you can supervise this session.
            </p>
            <Input
              id="maxStudents"
              type="number"
              min="1"
              max="20"
              value={maxStudents}
              onChange={(e) => setMaxStudents(e.target.value)}
              className="max-w-[100px]"
            />
          </div>
        </div>
        <div className="flex justify-end pt-4 gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={updateSettings.isPending}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {updateSettings.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
