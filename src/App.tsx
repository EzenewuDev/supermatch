import { Routes, Route, Navigate } from "react-router";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";
import AppLayout from "./components/AppLayout";

// Student pages
import StudentDashboard from "./pages/student/Dashboard";
import StudentPreferences from "./pages/student/Preferences";
import StudentResults from "./pages/student/Results";

// Supervisor pages
import SupervisorDashboard from "./pages/supervisor/Dashboard";
import SupervisorAllocations from "./pages/supervisor/Allocations";

// Admin pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminStudents from "./pages/admin/Students";
import AdminSupervisors from "./pages/admin/Supervisors";
import AdminAllocations from "./pages/admin/Allocations";
import AdminReports from "./pages/admin/Reports";

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Student routes */}
      <Route
        path="/student/*"
        element={
          <AppLayout>
            <Routes>
              <Route path="dashboard" element={<StudentDashboard />} />
              <Route path="preferences" element={<StudentPreferences />} />
              <Route path="results" element={<StudentResults />} />
              <Route path="*" element={<Navigate to="dashboard" replace />} />
            </Routes>
          </AppLayout>
        }
      />

      {/* Supervisor routes */}
      <Route
        path="/supervisor/*"
        element={
          <AppLayout>
            <Routes>
              <Route path="dashboard" element={<SupervisorDashboard />} />
              <Route path="allocations" element={<SupervisorAllocations />} />
              <Route path="*" element={<Navigate to="dashboard" replace />} />
            </Routes>
          </AppLayout>
        }
      />

      {/* Admin routes */}
      <Route
        path="/admin/*"
        element={
          <AppLayout>
            <Routes>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="students" element={<AdminStudents />} />
              <Route path="supervisors" element={<AdminSupervisors />} />
              <Route path="allocations" element={<AdminAllocations />} />
              <Route path="reports" element={<AdminReports />} />
              <Route path="*" element={<Navigate to="dashboard" replace />} />
            </Routes>
          </AppLayout>
        }
      />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
