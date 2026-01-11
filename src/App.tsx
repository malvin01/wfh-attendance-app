import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";

// Layouts
import EmployeeLayout from "./components/EmployeeLayout";
import AdminLayout from "./layouts/AdminLayout"; // Layout yang kita buat tadi

// Pages - Auth
import LoginPage from "./pages/auth/LoginPage";

// Pages - Employee
import AbsenPage from "./pages/employee/AbsenPage";
import SummaryPage from "./pages/employee/SummaryPage";
import ProfilePage from "./pages/employee/ProfilePage";

// Pages - Admin
import AdminDashboard from "./pages/admin/DashboardPage";
import AttendanceMonitoring from "./pages/admin/AttendanceMonitoring";
import EmployeeManagement from "./pages/admin/EmployeeManagement";

// Protected Route Component
import { ProtectedRoute } from "./components/ProtectedRoute";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster richColors closeButton position="top-center" />

      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />

          <Route element={<ProtectedRoute allowedRole="employee" />}>
            <Route path="/employee" element={<EmployeeLayout />}>
              <Route index element={<Navigate to="absen" replace />} />
              <Route path="absen" element={<AbsenPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="summary" element={<SummaryPage />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute allowedRole="admin" />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="employees" element={<EmployeeManagement />} />
              <Route path="monitoring" element={<AttendanceMonitoring />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;