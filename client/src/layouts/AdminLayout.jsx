import { useState, useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getTicketMetrics } from "../services/ticketAPI";

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
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const linkClass = ({ isActive }) =>
    `inline-flex items-center h-12 px-1 text-sm font-medium border-b-2 transition ${
      isActive
        ? "border-blue-500 text-white"
        : "border-transparent text-slate-300 hover:text-white hover:border-slate-500"
    }`;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <nav className="bg-slate-950 border-b border-slate-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-12">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                  A
                </div>
                <span className="font-semibold text-white text-sm">
                  Admin Portal
                </span>
              </div>

              <div className="hidden md:flex gap-5">
                <NavLink to="/admin/dashboard" className={linkClass}>
                  Dashboard
                </NavLink>
                <NavLink to="/admin/customers" className={linkClass}>
                  Customers
                </NavLink>
                <NavLink to="/admin/employees" className={linkClass}>
                  Employees
                </NavLink>
                <NavLink to="/admin/support" className={linkClass}>
                  <div className="flex items-center gap-1">
                    <span>Support</span>
                    {openTickets > 0 && (
                      <span className="bg-red-500 text-white text-[10px] font-semibold min-w-4 h-4 px-1 flex items-center justify-center rounded">
                        {openTickets}
                      </span>
                    )}
                  </div>
                </NavLink>
                <NavLink to="/admin/profile" className={linkClass}>
                  My Profile
                </NavLink>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-300 hidden sm:block truncate max-w-[10rem]">
                {user?.name}
              </span>
              <button
                onClick={handleLogout}
                className="text-sm text-red-400 hover:text-red-300 px-2 py-1 rounded hover:bg-slate-800 transition"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-5">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;
