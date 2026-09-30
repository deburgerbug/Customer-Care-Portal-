import { useState, useEffect } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getCustomerMetrics } from "../services/customerAPI";

/**
 * EmployeeLayout — Sidebar layout for Employee portal
 * Renders a sidebar navigation and a main content area for nested routes.
 */
function EmployeeLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [assignedCount, setAssignedCount] = useState(0);

  useEffect(() => {
    async function fetchNotifications() {
      try {
        const response = await getCustomerMetrics();
        setAssignedCount(response.data?.unreadCustomers || 0);
      } catch (err) {
        console.error("Failed to fetch employee notifications", err);
      }
    }
    fetchNotifications();

    // Poll every 60 seconds
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-800 text-white flex flex-col">
        <div className="p-4 flex items-center gap-3 border-b border-slate-700">
          <div className="w-8 h-8 rounded bg-blue-500 flex items-center justify-center font-bold">
            E
          </div>
          <div>
            <h2 className="text-sm font-bold">Employee Portal</h2>
            <p className="text-xs text-slate-400">Customer Care</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <Link
            to="/employee/customers"
            className="flex items-center justify-between px-4 py-2.5 rounded-md hover:bg-slate-700 transition text-sm font-medium"
          >
            <span>Customers</span>
            {assignedCount > 0 && (
              <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">
                {assignedCount}
              </span>
            )}
          </Link>
          <Link
            to="/employee/dashboard"
            className="block px-4 py-2.5 rounded-md hover:bg-slate-700 transition text-sm font-medium"
          >
            Dashboard
          </Link>
          <Link
            to="/employee/support"
            className="block px-4 py-2.5 rounded-md hover:bg-slate-700 transition text-sm font-medium"
          >
            Support Tickets
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-700">
          <div className="mb-4">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-xs text-slate-400 truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm font-medium transition"
          >
            Log Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-8">
        <Outlet />
      </main>
    </div>
  );
}

export default EmployeeLayout;
