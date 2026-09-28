import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * ProtectedRoute — Route guard component
 *
 * Used in: App.jsx — wraps any route that requires login
 * Example: <Route path="/" element={<ProtectedRoute><CustomerListPage /></ProtectedRoute>} />
 *
 * Behavior:
 *  - If auth is still loading → show a spinner
 *  - If user is NOT logged in → redirect to /login
 *  - If allowedRoles is provided and user role is not in it → redirect to a default safe page
 *  - If user IS logged in and authorized → render the child page
 */
function ProtectedRoute({ children, allowedRoles }) {
  const { user, isLoading } = useAuth();

  // Show loading spinner while checking auth state (e.g. reading localStorage)
  if (isLoading) {
    return (
      // Centered container with spinner — used as a full-page loading state
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        {/* Spinning circle animation */}
        <div className="w-9 h-9 border-3 border-gray-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  // Not logged in → redirect to login page
  // "replace" prevents the user from hitting "back" to return to the protected page
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Role check
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If they aren't authorized for this route, bounce them to their correct home
    if (user.role === "admin") return <Navigate to="/admin/customers" replace />;
    if (user.role === "employee") return <Navigate to="/employee/customers" replace />;
    return <Navigate to="/customer/profile" replace />;
  }

  // User is authenticated and authorized → render the protected page
  return children;
}

export default ProtectedRoute;
