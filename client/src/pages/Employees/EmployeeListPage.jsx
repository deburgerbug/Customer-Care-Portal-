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
    <div className="max-w-5xl">
      <div className="flex justify-between items-center gap-3 mb-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Employees</h1>
          <p className="text-sm text-gray-500">Staff accounts and access</p>
        </div>
        <HasPermission required={PERMISSIONS.EMPLOYEE_CREATE}>
          <Link
            to="/admin/employees/new"
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition"
          >
            + Create Employee
          </Link>
        </HasPermission>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm mb-3">
          {error}
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-10">
            <div className="w-7 h-7 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-500 mt-2 text-sm">Loading employees...</p>
          </div>
        ) : employees.length === 0 ? (
          <div className="py-10 text-center text-sm text-gray-500">No employees found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-500 uppercase tracking-wide">
                  <th className="py-2 px-3">Name</th>
                  <th className="py-2 px-3">Email</th>
                  <th className="py-2 px-3">Department</th>
                  <th className="py-2 px-3">Status</th>
                  <th className="py-2 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {employees.map((emp) => (
                  <tr key={emp._id} className="hover:bg-slate-50 transition">
                    <td className="py-2 px-3 font-medium text-gray-900">{emp.name}</td>
                    <td className="py-2 px-3 text-gray-600">{emp.email}</td>
                    <td className="py-2 px-3 text-gray-600">{emp.department || "—"}</td>
                    <td className="py-2 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 text-xs font-medium rounded ${
                          emp.isActive
                            ? "bg-green-50 text-green-700 border border-green-200"
                            : "bg-red-50 text-red-700 border border-red-200"
                        }`}
                      >
                        {emp.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => navigate(`/admin/support?assignedTo=${emp._id}`)}
                          className="px-2 py-0.5 text-xs font-medium text-blue-700 border border-blue-200 rounded hover:bg-blue-50"
                        >
                          Queue
                        </button>
                        <HasPermission required={PERMISSIONS.EMPLOYEE_DEACTIVATE}>
                          {emp.isActive && (
                            <button
                              onClick={() => handleDeactivate(emp._id)}
                              disabled={deactivatingId === emp._id}
                              className="px-2 py-0.5 text-xs font-medium text-red-700 border border-red-200 rounded hover:bg-red-50"
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
