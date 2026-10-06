import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function CustomerLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const linkClass = ({ isActive }) =>
    `inline-flex items-center h-12 px-1 text-sm font-medium border-b-2 transition ${
      isActive
        ? "border-blue-600 text-gray-900"
        : "border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300"
    }`;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between h-12">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                  C
                </div>
                <span className="font-semibold text-gray-900 text-sm">
                  Customer Care
                </span>
              </div>

              <div className="hidden md:flex gap-5">
                <NavLink to="/customer/profile" className={linkClass}>
                  My Profile
                </NavLink>
                <NavLink to="/customer/support" className={linkClass}>
                  Support
                </NavLink>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600 hidden sm:block truncate max-w-[10rem]">
                {user?.name}
              </span>
              <button
                onClick={handleLogout}
                className="text-sm text-red-600 hover:text-red-800 px-2 py-1 rounded hover:bg-red-50 transition"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-5">
        <Outlet />
      </main>
    </div>
  );
}

export default CustomerLayout;
