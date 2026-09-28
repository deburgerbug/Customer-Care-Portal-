import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import LoginPage from "./pages/Authentication/LoginPage";
import RegisterPage from "./pages/Authentication/RegisterPage";
import ForgotPasswordPage from "./pages/Authentication/ForgotPasswordPage";
import ResetPasswordPage from "./pages/Authentication/ResetPasswordPage";
import VerifyEmailPage from "./pages/Authentication/VerifyEmailPage";

import CustomerListPage from "./pages/Customer/CustomerListPage";
import CustomerPage from "./pages/Customer/CustomerPage";
import CustomerDetailsPage from "./pages/Customer/CustomerDetailsPage";

import EmployeeListPage from "./pages/Employees/EmployeeListPage";
import EmployeeFormPage from "./pages/Employees/EmployeeFormPage";
import EmployeeDashboard from "./pages/Employees/EmployeeDashboard";

import AdminDashboard from "./pages/Admin/AdminDashboard";

import TicketListPage from "./pages/Tickets/TicketListPage";
import TicketFormPage from "./pages/Tickets/TicketFormPage";
import TicketDetailsPage from "./pages/Tickets/TicketDetailsPage";

import AdminLayout from "./layouts/AdminLayout";
import EmployeeLayout from "./layouts/EmployeeLayout";
import CustomerLayout from "./layouts/CustomerLayout";
import "./App.css";

/**
 * Automatically redirects the root URL to the user's role-specific dashboard,
 * or to the login page if they are not authenticated.
 */
function RootRedirect() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === "admin") return <Navigate to="/admin/customers" replace />;
  if (user.role === "employee") return <Navigate to="/employee/customers" replace />;
  
  return <Navigate to="/customer/profile" replace />;
}


function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage/>} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage/>} />
          <Route path="/verify-email/:token" element={<VerifyEmailPage/>} />

          {/* Protected Role-Based Routes */}

          {/* Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute allowedRoles={["admin"]}><AdminLayout /></ProtectedRoute>}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="customers" element={<CustomerListPage />} />
            <Route path="customers/new" element={<CustomerPage />} />
            <Route path="customers/:id" element={<CustomerDetailsPage />} />
            <Route path="customers/:id/edit" element={<CustomerPage />} />
            <Route path="employees" element={<EmployeeListPage />} />
            <Route path="employees/new" element={<EmployeeFormPage />} />
            <Route path="support" element={<TicketListPage />} />
            <Route path="support/:id" element={<TicketDetailsPage />} />
          </Route>

          {/* Employee Routes */}
          <Route path="/employee" element={<ProtectedRoute allowedRoles={["employee", "admin"]}><EmployeeLayout /></ProtectedRoute>}>
            <Route path="dashboard" element={<EmployeeDashboard />} />
            <Route path="customers" element={<CustomerListPage />} />
            <Route path="customers/new" element={<CustomerPage />} />
            <Route path="customers/:id" element={<CustomerDetailsPage />} />
            <Route path="customers/:id/edit" element={<CustomerPage />} />
            <Route path="support" element={<TicketListPage />} />
            <Route path="support/:id" element={<TicketDetailsPage />} />
          </Route>

          {/* Customer Routes */}
          <Route path="/customer" element={<ProtectedRoute allowedRoles={["customer"]}><CustomerLayout /></ProtectedRoute>}>
            <Route path="profile" element={<CustomerDetailsPage />} />
            <Route path="support" element={<TicketListPage />} />
            <Route path="support/new" element={<TicketFormPage />} />
            <Route path="support/:id" element={<TicketDetailsPage />} />
          </Route>

          {/* Root Redirect - Sends user to correct dashboard */}
          <Route path="/" element={<RootRedirect />} />

          {/* Fallback redirect */}
          <Route path="*" element={<RootRedirect />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;