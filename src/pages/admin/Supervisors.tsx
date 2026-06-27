import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  UserCheck,
  Plus,
  Pencil,
  Trash2,
} from "lucide-react";

const DEPARTMENTS = [
  "Computer Science",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Mathematics",
];

export default function AdminSupervisors() {
  const utils = trpc.useUtils();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editSupervisor, setEditSupervisor] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: supervisors, isLoading } =
    trpc.admin.supervisors.list.useQuery();

  const createMutation = trpc.admin.supervisors.create.useMutation({
    onSuccess: () => {
      toast.success("Supervisor created");
      utils.admin.supervisors.list.invalidate();
      utils.admin.dashboard.kpis.invalidate();
      setIsAddOpen(false);
    },
  });

  const updateMutation = trpc.admin.supervisors.update.useMutation({
    onSuccess: () => {
      toast.success("Supervisor updated");
      utils.admin.supervisors.list.invalidate();
      utils.admin.dashboard.kpis.invalidate();
      setEditSupervisor(null);
    },
  });

  const deleteMutation = trpc.admin.supervisors.delete.useMutation({
    onSuccess: () => {
      toast.success("Supervisor deleted");
      utils.admin.supervisors.list.invalidate();
      utils.admin.dashboard.kpis.invalidate();
      setDeleteId(null);
    },
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <UserCheck className="w-6 h-6 text-slate-600" />
          <h2 className="text-xl font-semibold text-slate-900">Supervisors</h2>
          <Badge variant="secondary" className="text-xs">
            {supervisors?.length || 0} total
          </Badge>
        </div>
        <Button size="sm" onClick={() => setIsAddOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Supervisor
        </Button>
      </div>

      {/* Table */}
      <Card className="border-slate-200">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Max Capacity
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Current Load
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Available
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {supervisors?.map((supervisor) => (
                    <tr
                      key={supervisor.id}
                      className="hover:bg-blue-50/50 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm font-medium text-slate-900">
                        {supervisor.name}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {supervisor.department}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {supervisor.maxStudents}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-slate-600">
                          {supervisor.currentLoad} / {supervisor.maxStudents}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Switch
                          checked={supervisor.isAvailable}
                          onCheckedChange={(checked) =>
                            updateMutation.mutate({
                              id: supervisor.id,
                              isAvailable: checked,
                            })
                          }
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => setEditSupervisor(supervisor)}
                          >
                            <Pencil className="w-4 h-4 text-slate-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => setDeleteId(supervisor.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Supervisor Dialog */}
      <SupervisorDialog
        open={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSubmit={(data) => createMutation.mutate(data)}
        isSubmitting={createMutation.isPending}
        title="Add Supervisor"
      />

      {/* Edit Supervisor Dialog */}
      {editSupervisor && (
        <SupervisorDialog
          open={!!editSupervisor}
          onClose={() => setEditSupervisor(null)}
          onSubmit={(data) =>
            updateMutation.mutate({ id: editSupervisor.id, ...data })
          }
          isSubmitting={updateMutation.isPending}
          title="Edit Supervisor"
          defaultValues={editSupervisor}
        />
      )}

      {/* Delete Confirmation */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-500">
            Are you sure you want to delete this supervisor? All associated
            allocations will be affected.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                deleteId && deleteMutation.mutate({ id: deleteId })
              }
              disabled={deleteMutation.isPending}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SupervisorDialog({
  open,
  onClose,
  onSubmit,
  isSubmitting,
  title,
  defaultValues,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
  title: string;
  defaultValues?: any;
}) {
  const [form, setForm] = useState({
    name: defaultValues?.name || "",
    department: defaultValues?.department || "",
    maxStudents: defaultValues?.maxStudents || 5,
  });

  useState(() => {
    if (defaultValues) {
      setForm({
        name: defaultValues.name || "",
        department: defaultValues.department || "",
        maxStudents: defaultValues.maxStudents || 5,
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name: form.name,
      department: form.department,
      maxStudents: form.maxStudents,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g., Dr. Smith"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Select
              value={form.department}
              onValueChange={(v) => setForm({ ...form, department: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {DEPARTMENTS.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="maxStudents">
              Max Students: {form.maxStudents}
            </Label>
            <Input
              id="maxStudents"
              type="range"
              min={1}
              max={10}
              value={form.maxStudents}
              onChange={(e) =>
                setForm({ ...form, maxStudents: parseInt(e.target.value) })
              }
              className="w-full"
            />
            <div className="flex justify-between text-xs text-slate-400">
              <span>1</span>
              <span>5</span>
              <span>10</span>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
