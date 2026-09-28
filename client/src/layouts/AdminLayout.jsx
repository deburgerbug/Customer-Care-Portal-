import { useState, useEffect } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getTicketMetrics } from "../services/ticketAPI";

/**
 * AdminLayout — Sidebar layout for Admin portal
 * Renders a sidebar navigation with expanded options and a main content area.
 */
function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [openTickets, setOpenTickets] = useState(0);

  useEffect(() => {
    async function fetchNotifications() {
      try {
        const res = await getTicketMetrics();
        setOpenTickets(res.data?.openTickets || 0);
      } catch (err) {
        console.error("Failed to fetch admin notifications", err);
      }
    }
    fetchNotifications();
    
    // Poll every 30 seconds for new tickets (simple simulation of real-time)
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-indigo-900 text-white flex flex-col">
        <div className="p-4 flex items-center gap-3 border-b border-indigo-800">
          <div className="w-8 h-8 rounded bg-indigo-500 flex items-center justify-center font-bold">
            A
          </div>
          <div>
            <h2 className="text-sm font-bold">Admin Portal</h2>
            <p className="text-xs text-indigo-300">Customer Care</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <Link
            to="/admin/dashboard"
            className="block px-4 py-2.5 rounded-md hover:bg-indigo-800 transition text-sm font-medium"
          >
            Dashboard
          </Link>
          <Link
            to="/admin/customers"
            className="block px-4 py-2.5 rounded-md hover:bg-indigo-800 transition text-sm font-medium"
          >
            All Customers
          </Link>
          <Link
            to="/admin/employees"
            className="block px-4 py-2.5 rounded-md hover:bg-indigo-800 transition text-sm font-medium"
          >
            Manage Employees
          </Link>
          <Link
            to="/admin/support"
            className="flex items-center justify-between px-4 py-2.5 rounded-md hover:bg-indigo-800 transition text-sm font-medium"
          >
            <span>Support Tickets</span>
            {openTickets > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {openTickets}
              </span>
            )}
          </Link>
        </nav>

        <div className="p-4 border-t border-indigo-800">
          <div className="mb-4">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-xs text-indigo-300 truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full py-2 bg-indigo-800 hover:bg-indigo-700 rounded text-sm font-medium transition"
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

export default AdminLayout;
