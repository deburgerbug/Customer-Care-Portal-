import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * CustomerLayout — Top navbar layout for Customer portal
 * Renders a top navigation bar and a centered main content area.
 */
function CustomerLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navbar */}
      <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-md bg-blue-600 text-white flex items-center justify-center font-bold mr-3">
                C
              </div>
              <span className="font-bold text-xl text-gray-900">
                Customer Care
              </span>
              
              <div className="hidden md:flex space-x-8 ml-10">
                <Link
                  to="/customer/profile"
                  className="inline-flex items-center px-1 pt-1 border-b-2 border-blue-500 text-sm font-medium text-gray-900"
                >
                  My Profile
                </Link>
                <Link
                  to="/customer/support"
                  className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 transition"
                >
                  Support
                </Link>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700 hidden sm:block">
                {user?.name}
              </span>
              <button
                onClick={handleLogout}
                className="text-sm text-red-600 font-medium hover:text-red-800 transition px-3 py-2 rounded-md hover:bg-red-50"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}

export default CustomerLayout;
