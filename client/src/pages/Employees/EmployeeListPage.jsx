import { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getEmployees, deleteEmployee } from "../../services/userAPI.js";
import HasPermission from "../../components/HasPermission.jsx";
import { PERMISSIONS } from "../../config/permissions.js";

import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";

function EmployeeListPage() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [deactivatingId, setDeactivatingId] = useState(null);

  const loadEmployees = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  const handleDeactivate = useCallback(async (id) => {
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
  }, [loadEmployees]);

  const StatusRenderer = useCallback((params) => {
    const isActive = params.value;
    return (
      <span
        className={`inline-block px-2 py-0.5 text-xs font-medium rounded mt-1.5 ${
          isActive
            ? "bg-green-50 text-green-700 border border-green-200"
            : "bg-red-50 text-red-700 border border-red-200"
        }`}
      >
        {isActive ? "Active" : "Inactive"}
      </span>
    );
  }, []);

  const ActionsRenderer = useCallback((params) => {
    const emp = params.data;
    return (
      <div className="flex items-center gap-1.5 mt-1.5">
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
    );
  }, [navigate, handleDeactivate, deactivatingId]);

  const colDefs = useMemo(
    () => [
      { field: "name", headerName: "Name", flex: 1, filter: true },
      { field: "email", headerName: "Email", flex: 1.5, filter: true },
      { field: "department", headerName: "Department", flex: 1, filter: true },
      {
        field: "isActive",
        headerName: "Status",
        flex: 1,
        cellRenderer: StatusRenderer,
      },
      {
        headerName: "Actions",
        flex: 1.5,
        cellRenderer: ActionsRenderer,
        sortable: false,
        filter: false,
      },
    ],
    [StatusRenderer, ActionsRenderer]
  );

  const defaultColDef = useMemo(() => ({
    sortable: true,
    filter: true,
    resizable: true,
  }), []);

  return (
    <div className="max-w-5xl h-[calc(100vh-120px)] flex flex-col">
      <div className="flex justify-between items-center gap-3 mb-4 shrink-0">
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
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm mb-3 shrink-0">
          {error}
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden flex-1 flex flex-col">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center flex-1">
            <div className="w-7 h-7 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-500 mt-2 text-sm">Loading employees...</p>
          </div>
        ) : employees.length === 0 ? (
          <div className="flex items-center justify-center flex-1 text-sm text-gray-500">
            No employees found.
          </div>
        ) : (
          <div className="ag-theme-quartz w-full h-full">
            <AgGridReact
              rowData={employees}
              columnDefs={colDefs}
              defaultColDef={defaultColDef}
              rowSelection="multiple"
              pagination={true}
              paginationPageSize={10}
              paginationPageSizeSelector={[10, 20, 50]}
              animateRows={true}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default EmployeeListPage;
