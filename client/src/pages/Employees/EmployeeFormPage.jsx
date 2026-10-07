import { useCallback, useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createEmployee } from "../../services/userAPI";
import { getDepartments } from "../../services/departmentAPI";

function EmployeeFormPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    department: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(true);
  const [departmentError, setDepartmentError] = useState("");
  const [error, setError] = useState("");

  const loadDepartments = useCallback(async () => {
    try {
      setIsLoadingDepartments(true);
      setDepartmentError("");
      const response = await getDepartments();
      setDepartments(response.data || []);
    } catch (err) {
      setDepartmentError(err.message || "Failed to load departments");
    } finally {
      setIsLoadingDepartments(false);
    }
  }, []);

  useEffect(() => {
    loadDepartments();
  }, [loadDepartments]);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password || !formData.department) {
      setError("All fields are required");
      return;
    }
    if (isLoadingDepartments || departmentError || departments.length === 0) {
      setError("A department must be available before creating an employee");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");
      await createEmployee(formData);
      navigate("/admin/employees");
    } catch (err) {
      setError(err.message || "Failed to create employee");
    } finally {
      setIsSubmitting(false);
    }
  }

  const inputClass =
    "px-3 py-2 border border-gray-200 rounded-md outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600/20 text-sm";

  return (
    <div className="max-w-3xl">
      <div className="flex justify-between items-center gap-3 mb-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Create Employee</h1>
          <p className="text-sm text-gray-500">Register a new staff account</p>
        </div>
        <Link
          to="/admin/employees"
          className="px-3 py-1.5 text-sm text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50"
        >
          ← Back
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm mb-3">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white border border-gray-200 rounded-lg p-4 sm:p-5"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label htmlFor="name" className="text-sm font-medium text-gray-700">
              Full Name *
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Jane Doe"
              className={inputClass}
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email *
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="jane.doe@company.com"
              className={inputClass}
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="text-sm font-medium text-gray-700">
              Temporary Password *
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Minimum 6 characters"
              className={inputClass}
              required
              minLength="6"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="department" className="text-sm font-medium text-gray-700">
              Department *
            </label>
            <select
              id="department"
              name="department"
              value={formData.department}
              onChange={handleChange}
              className={inputClass}
              required
              disabled={isLoadingDepartments || Boolean(departmentError) || departments.length === 0}
            >
              <option value="">
                {isLoadingDepartments
                  ? "Loading departments..."
                  : departments.length === 0
                    ? "No active departments available"
                    : "Select Department"}
              </option>
              {departments.map((department) => (
                <option key={department._id} value={department._id}>
                  {department.departmentName}
                </option>
              ))}
            </select>
            {departmentError && (
              <div className="flex items-center gap-2 text-xs text-red-600">
                <span>{departmentError}</span>
                <button
                  type="button"
                  onClick={loadDepartments}
                  className="underline hover:text-red-800"
                >
                  Retry
                </button>
              </div>
            )}
            {!isLoadingDepartments && !departmentError && departments.length === 0 && (
              <p className="text-xs text-gray-500">
                Create or reactivate a department before adding an employee.
              </p>
            )}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end gap-2">
          <Link
            to="/admin/employees"
            className="px-3 py-1.5 text-sm text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting || isLoadingDepartments || Boolean(departmentError) || departments.length === 0}
            className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-60"
          >
            {isSubmitting ? "Creating..." : "Create Employee"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EmployeeFormPage;
