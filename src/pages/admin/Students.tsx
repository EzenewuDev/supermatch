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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Users,
  Search,
  Plus,
  Pencil,
  Trash2,
  Upload,
  GraduationCap,
} from "lucide-react";

export default function AdminStudents() {
  const utils = trpc.useUtils();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [level, setLevel] = useState("");
  const [status, setStatus] = useState("");

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editStudent, setEditStudent] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [csvText, setCsvText] = useState("");
  const [isImportOpen, setIsImportOpen] = useState(false);

  const { data, isLoading } = trpc.admin.students.list.useQuery({
    page,
    limit: 20,
    search: search || undefined,
    department: department || undefined,
    level: level || undefined,
    status: status || undefined,
  });

  const { data: meta } = trpc.admin.students.meta.useQuery();

  const createMutation = trpc.admin.students.create.useMutation({
    onSuccess: () => {
      toast.success("Student created");
      utils.admin.students.list.invalidate();
      utils.admin.dashboard.kpis.invalidate();
      setIsAddOpen(false);
    },
  });

  const updateMutation = trpc.admin.students.update.useMutation({
    onSuccess: () => {
      toast.success("Student updated");
      utils.admin.students.list.invalidate();
      setEditStudent(null);
    },
  });

  const deleteMutation = trpc.admin.students.delete.useMutation({
    onSuccess: () => {
      toast.success("Student deleted");
      utils.admin.students.list.invalidate();
      utils.admin.dashboard.kpis.invalidate();
      setDeleteId(null);
    },
  });

  const importMutation = trpc.admin.students.import.useMutation({
    onSuccess: (result) => {
      toast.success(`Imported ${result.imported} students`);
      if (result.errors.length > 0) {
        result.errors.forEach((e) => toast.error(e));
      }
      utils.admin.students.list.invalidate();
      utils.admin.dashboard.kpis.invalidate();
      setIsImportOpen(false);
      setCsvText("");
    },
  });

  const statusColors: Record<string, string> = {
    pending: "bg-blue-100 text-blue-700 hover:bg-blue-100",
    allocated: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
    unallocated: "bg-amber-100 text-amber-700 hover:bg-amber-100",
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-slate-600" />
          <h2 className="text-xl font-semibold text-slate-900">Students</h2>
          <Badge variant="secondary" className="text-xs">
            {data?.total || 0} total
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsImportOpen(true)}
          >
            <Upload className="w-4 h-4 mr-2" />
            Import CSV
          </Button>
          <Button size="sm" onClick={() => setIsAddOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Student
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-slate-200">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-10"
              />
            </div>
            <Select value={department} onValueChange={setDepartment}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Departments</SelectItem>
                {meta?.departments?.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={level} onValueChange={setLevel}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Levels</SelectItem>
                {meta?.levels?.map((l) => (
                  <SelectItem key={l} value={l}>
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="allocated">Allocated</SelectItem>
                <SelectItem value="unallocated">Unallocated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

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
                      ID
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      CGPA
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Dept
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Level
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data?.data.map((student) => (
                    <tr
                      key={student.id}
                      className="hover:bg-blue-50/50 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm text-slate-600 font-mono">
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
                            statusColors[student.allocationStatus] || ""
                          }`}
                        >
                          {student.allocationStatus}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => setEditStudent(student)}
                          >
                            <Pencil className="w-4 h-4 text-slate-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => setDeleteId(student.id)}
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

          {/* Pagination */}
          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200">
              <p className="text-sm text-slate-500">
                Page {data.page} of {data.totalPages}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= data.totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Student Dialog */}
      <StudentDialog
        open={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSubmit={(data) => createMutation.mutate(data)}
        isSubmitting={createMutation.isPending}
        title="Add Student"
        departments={meta?.departments || []}
        levels={meta?.levels || []}
      />

      {/* Edit Student Dialog */}
      {editStudent && (
        <StudentDialog
          open={!!editStudent}
          onClose={() => setEditStudent(null)}
          onSubmit={(data) =>
            updateMutation.mutate({ id: editStudent.id, ...data })
          }
          isSubmitting={updateMutation.isPending}
          title="Edit Student"
          defaultValues={editStudent}
          departments={meta?.departments || []}
          levels={meta?.levels || []}
        />
      )}

      {/* Delete Confirmation */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-500">
            Are you sure you want to delete this student? This action cannot be
            undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteId && deleteMutation.mutate({ id: deleteId })}
              disabled={deleteMutation.isPending}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import CSV Dialog */}
      <Dialog open={isImportOpen} onOpenChange={() => setIsImportOpen(false)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Import Students from CSV</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-slate-500">
              Paste CSV data with columns: studentId, name, cgpa, department,
              level
            </p>
            <textarea
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              placeholder={`studentId,name,cgpa,department,level\nS051,John Doe,3.50,Computer Science,400\nS052,Jane Smith,3.75,Electrical Engineering,300`}
              className="w-full h-40 p-3 text-sm border border-slate-200 rounded-lg font-mono resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsImportOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => importMutation.mutate({ csvData: csvText })}
              disabled={!csvText.trim() || importMutation.isPending}
            >
              <Upload className="w-4 h-4 mr-2" />
              {importMutation.isPending ? "Importing..." : "Import"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StudentDialog({
  open,
  onClose,
  onSubmit,
  isSubmitting,
  title,
  defaultValues,
  departments,
  levels,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
  title: string;
  defaultValues?: any;
  departments: string[];
  levels: string[];
}) {
  const [form, setForm] = useState({
    studentId: defaultValues?.studentId || "",
    name: defaultValues?.name || "",
    cgpa: defaultValues?.cgpa ? parseFloat(String(defaultValues.cgpa)) : "",
    department: defaultValues?.department || "",
    level: defaultValues?.level || "",
  });

  // Reset form when defaultValues change
  useState(() => {
    if (defaultValues) {
      setForm({
        studentId: defaultValues.studentId || "",
        name: defaultValues.name || "",
        cgpa: defaultValues.cgpa ? parseFloat(String(defaultValues.cgpa)) : "",
        department: defaultValues.department || "",
        level: defaultValues.level || "",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      studentId: form.studentId,
      name: form.name,
      cgpa: parseFloat(String(form.cgpa)),
      department: form.department,
      level: form.level,
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
            <Label htmlFor="studentId">Student ID</Label>
            <Input
              id="studentId"
              value={form.studentId}
              onChange={(e) => setForm({ ...form, studentId: e.target.value })}
              placeholder="e.g., S001"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Full name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cgpa">CGPA (0.0 - 4.0)</Label>
            <Input
              id="cgpa"
              type="number"
              step="0.01"
              min="0"
              max="4"
              value={form.cgpa}
              onChange={(e) => setForm({ ...form, cgpa: e.target.value })}
              placeholder="3.50"
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
                {departments.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="level">Level</Label>
            <Select
              value={form.level}
              onValueChange={(v) => setForm({ ...form, level: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                {levels.map((l) => (
                  <SelectItem key={l} value={l}>
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
