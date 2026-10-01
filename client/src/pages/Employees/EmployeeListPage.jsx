import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getEmployees, deleteEmployee } from "../../services/userAPI.js";
import HasPermission from "../../components/HasPermission.jsx";
import { PERMISSIONS } from "../../config/permissions.js";

// Removed PERMISSION_MODULES as granular perms are scoped out for now

function EmployeeListPage() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [deactivatingId, setDeactivatingId] = useState(null);


  useEffect(() => {
    loadEmployees();
  }, []);

  async function loadEmployees() {
    try {
      setIsLoading(true);
      setError("");
      const response = await getEmployees();
      setEmployees(response.data || []);
    } catch (err) {
      setError(err.message || "Failed to load employee list");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDeactivate(id) {
    if (!window.confirm("Are you sure you want to deactivate this employee?")) return;
    try {
      setDeactivatingId(id);
      await deleteEmployee(id);
      await loadEmployees();
    } catch (err) {
      alert(`Error deactivating employee: ${err.message}`);
    } finally {
      setDeactivatingId(null);
    }
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 relative">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Manage Employees</h1>
          <p className="text-sm text-gray-500 mt-1">Manage staff accounts and their module access</p>
        </div>
        <HasPermission required={PERMISSIONS.EMPLOYEE_CREATE}>
          <Link
            to="/admin/employees/new"
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-sm transition inline-flex items-center gap-2"
          >
            <span>+</span> Create Employee
          </Link>
        </HasPermission>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6">
          <strong className="font-bold">Error:</strong> {error}
        </div>
      )}

      {/* Main Content */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-12">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 mt-3 text-sm">Loading employees...</p>
          </div>
        ) : employees.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500">No employees found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Name</th>
                  <th className="py-3.5 px-6">Email</th>
                  <th className="py-3.5 px-6">Department</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {employees.map((emp) => (
                  <tr key={emp._id} className="hover:bg-indigo-50/40 transition">
                    <td className="py-3.5 px-6 font-semibold text-gray-900">{emp.name}</td>
                    <td className="py-3.5 px-6 text-gray-600">{emp.email}</td>
                    <td className="py-3.5 px-6 text-gray-600">{emp.department || "N/A"}</td>
                    <td className="py-3.5 px-6">
                      <span className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-full ${emp.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}>
                        {emp.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <div className="flex justify-end gap-2">
                        {/* View Action - navigate to ticket list filtered by this employee */}
                        <button
                          onClick={() => navigate(`/admin/support?assignedTo=${emp._id}`)}
                          className="px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-600 hover:text-white transition"
                        >
                          View Queue
                        </button>

                        <HasPermission required={PERMISSIONS.EMPLOYEE_DEACTIVATE}>
                          {emp.isActive && (
                            <button
                              onClick={() => handleDeactivate(emp._id)}
                              disabled={deactivatingId === emp._id}
                              className="px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-600 hover:text-white transition"
                            >
                              {deactivatingId === emp._id ? "..." : "Deactivate"}
                            </button>
                          )}
                        </HasPermission>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}

export default EmployeeListPage;
