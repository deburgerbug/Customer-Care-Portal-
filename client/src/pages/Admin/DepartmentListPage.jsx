import { useCallback, useEffect, useMemo, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import {
  createDepartment,
  deactivateDepartment,
  getDepartments,
  reactivateDepartment,
  updateDepartment,
} from "../../services/departmentAPI.js";

function DepartmentListPage() {
  const [departments, setDepartments] = useState([]);
  const [departmentName, setDepartmentName] = useState("");
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadDepartments = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");
      const response = await getDepartments({ includeInactive: true });
      setDepartments(response.data || []);
    } catch (err) {
      setError(err.message || "Failed to load departments");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDepartments();
  }, [loadDepartments]);

  const startEditing = useCallback((department) => {
    setEditingDepartment(department);
    setDepartmentName(department.departmentName);
    setError("");
    setNotice("");
  }, []);

  function cancelEditing() {
    setEditingDepartment(null);
    setDepartmentName("");
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const trimmedName = departmentName.trim();
    if (!trimmedName) {
      setError("Department name is required");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");
      setNotice("");
      if (editingDepartment) {
        await updateDepartment(editingDepartment._id, trimmedName);
        setNotice("Department updated successfully.");
      } else {
        await createDepartment(trimmedName);
        setNotice("Department created successfully.");
      }
      setEditingDepartment(null);
      setDepartmentName("");
      await loadDepartments();
    } catch (err) {
      setError(err.message || "Failed to save department");
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleDeactivate = useCallback(async (department) => {
    if (!window.confirm(`Deactivate the "${department.departmentName}" department?`)) {
      return;
    }

    try {
      setUpdatingStatusId(department._id);
      setError("");
      setNotice("");
      await deactivateDepartment(department._id);
      setNotice("Department deactivated. Existing employee assignments are retained.");
      await loadDepartments();
    } catch (err) {
      setError(err.message || "Failed to deactivate department");
    } finally {
      setUpdatingStatusId(null);
    }
  }, [loadDepartments]);

  const handleReactivate = useCallback(async (department) => {
    try {
      setUpdatingStatusId(department._id);
      setError("");
      setNotice("");
      await reactivateDepartment(department._id);
      setNotice("Department reactivated successfully.");
      await loadDepartments();
    } catch (err) {
      setError(err.message || "Failed to reactivate department");
    } finally {
      setUpdatingStatusId(null);
    }
  }, [loadDepartments]);

  const StatusRenderer = useCallback(({ value }) => (
    <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded mt-1.5 ${
      value
        ? "bg-green-50 text-green-700 border border-green-200"
        : "bg-gray-100 text-gray-600 border border-gray-200"
    }`}>
      {value ? "Active" : "Inactive"}
    </span>
  ), []);

  const ActionsRenderer = useCallback(({ data }) => (
    <div className="flex items-center gap-2 mt-1.5">
      {data.status ? (
        <>
          <button
            type="button"
            onClick={() => startEditing(data)}
            className="px-2.5 py-1 text-xs font-medium text-blue-700 border border-blue-200 rounded hover:bg-blue-50"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => handleDeactivate(data)}
            disabled={updatingStatusId === data._id}
            className="px-2.5 py-1 text-xs font-medium text-red-700 border border-red-200 rounded hover:bg-red-50 disabled:opacity-60"
          >
            {updatingStatusId === data._id ? "Deactivating..." : "Deactivate"}
          </button>
        </>
      ) : (
        <button
          type="button"
          onClick={() => handleReactivate(data)}
          disabled={updatingStatusId === data._id}
          className="px-2.5 py-1 text-xs font-medium text-green-700 border border-green-200 rounded hover:bg-green-50 disabled:opacity-60"
        >
          {updatingStatusId === data._id ? "Reactivating..." : "Reactivate"}
        </button>
      )}
    </div>
  ), [updatingStatusId, handleDeactivate, handleReactivate, startEditing]);

  const columnDefs = useMemo(() => [
    { field: "departmentName", headerName: "Department", flex: 1, filter: true },
    {
      field: "status",
      headerName: "Status",
      flex: 0.7,
      cellRenderer: StatusRenderer,
    },
    {
      headerName: "Actions",
      flex: 1,
      cellRenderer: ActionsRenderer,
      sortable: false,
      filter: false,
    },
  ], [ActionsRenderer, StatusRenderer]);

  const defaultColDef = useMemo(() => ({
    sortable: true,
    filter: true,
    resizable: true,
  }), []);

  const inputClass =
    "w-full px-3 py-2 border border-gray-200 rounded-md text-sm outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600/20";

  return (
    <div className="max-w-5xl">
      <div className="mb-4">
        <h1 className="text-xl font-semibold text-gray-900">Departments</h1>
        <p className="text-sm text-gray-500">
          Create and manage the departments available to employees.
        </p>
      </div>

      {error && (
        <div role="alert" className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm mb-3">
          {error}
        </div>
      )}
      {notice && (
        <div role="status" className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-md text-sm mb-3">
          {notice}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white border border-gray-200 rounded-lg p-4 mb-4"
      >
        <label htmlFor="departmentName" className="block text-sm font-medium text-gray-700 mb-1">
          {editingDepartment ? "Edit department" : "New department"}
        </label>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            id="departmentName"
            type="text"
            value={departmentName}
            onChange={(event) => setDepartmentName(event.target.value)}
            maxLength={80}
            placeholder="Department name"
            className={inputClass}
            disabled={isSubmitting}
            required
          />
          <div className="flex gap-2 shrink-0">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-60"
            >
              {isSubmitting
                ? "Saving..."
                : editingDepartment
                  ? "Save Changes"
                  : "Add Department"}
            </button>
            {editingDepartment && (
              <button
                type="button"
                onClick={cancelEditing}
                disabled={isSubmitting}
                className="px-3 py-2 text-sm text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </form>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-gray-500">Loading departments...</div>
        ) : departments.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500">No departments found.</div>
        ) : (
          <div className="ag-theme-quartz w-full h-[calc(100vh-330px)] min-h-64">
            <AgGridReact
              rowData={departments}
              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
              getRowId={({ data }) => data._id}
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

export default DepartmentListPage;