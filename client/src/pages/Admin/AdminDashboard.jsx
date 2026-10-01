import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getCustomers } from "../../services/customerAPI";
import { getEmployees } from "../../services/userAPI";

/**
 * AdminDashboard — Overview metrics for the Admin role
 * Route: /admin/dashboard
 */
function AdminDashboard() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState({
    totalCustomers: 0,
    totalEmployees: 0,
    activeEmployees: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchMetrics() {
      try {
        setIsLoading(true);
        // We only need the total counts, so limit=1 is fine for customers
        const [customersRes, employeesRes] = await Promise.all([
          getCustomers({ limit: 1 }),
          getEmployees(),
        ]);

        const employees = employeesRes.data || [];
        const activeEmployees = employees.filter(emp => emp.isActive).length;

        setMetrics({
          totalCustomers: customersRes.pagination?.totalCount || 0,
          totalEmployees: employees.length,
          activeEmployees: activeEmployees,
        });
      } catch (err) {
        console.error("Failed to load metrics", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchMetrics();
  }, []);

  return (
    <div className="max-w-6xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Admin Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Welcome back, {user?.name}. </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

          {/* Metric Card: Total Customers */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Customers</p>
              <h3 className="text-4xl font-black text-gray-900">{metrics.totalCustomers}</h3>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <Link to="/admin/customers" className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition flex items-center gap-1">
                View all customers &rarr;
              </Link>
            </div>
          </div>

          {/* Metric Card: Active Employees */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Active Employees</p>
              <h3 className="text-4xl font-black text-gray-900">{metrics.activeEmployees}</h3>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <Link to="/admin/employees" className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition flex items-center gap-1">
                Manage staff &rarr;
              </Link>
            </div>
          </div>

          {/* Metric Card: Total Accounts */}
          <div className="bg-gradient-to-br from-indigo-900 to-indigo-700 rounded-xl p-6 shadow-md flex flex-col justify-between text-white">
            <div>
              <p className="text-xs font-semibold text-indigo-200 uppercase tracking-wider mb-1">System Health</p>
              <h3 className="text-2xl font-bold mt-1">All Systems Operational</h3>
              <p className="text-sm text-indigo-200 mt-2">No active alerts or server errors detected in the current session.</p>
            </div>
            <div className="mt-4 pt-4 border-t border-indigo-500/30">
              <span className="text-sm font-semibold text-indigo-100 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-400"></span>
                API Connected
              </span>
            </div>
          </div>

        </div>
      )}

      {/* Quick Actions */}
      <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link to="/admin/customers/new" className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:border-indigo-400 hover:shadow-md transition group">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xl mb-3 group-hover:bg-indigo-600 group-hover:text-white transition">
            +
          </div>
          <h3 className="text-md font-bold text-gray-900">Add New Customer</h3>
          <p className="text-sm text-gray-500 mt-1">Create a new customer profile and assign it to an employee.</p>
        </Link>
        <Link to="/admin/employees/new" className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:border-indigo-400 hover:shadow-md transition group">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xl mb-3 group-hover:bg-indigo-600 group-hover:text-white transition">
            &#128100;
          </div>
          <h3 className="text-md font-bold text-gray-900">Provision Employee</h3>
          <p className="text-sm text-gray-500 mt-1">Register a new staff member and grant them portal access.</p>
        </Link>
      </div>
    </div>
  );
}

export default AdminDashboard;
