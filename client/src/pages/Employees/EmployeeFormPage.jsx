import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createEmployee } from "../../services/userAPI";

/**
 * EmployeeFormPage — Admin view for creating a new employee
 * Route: /admin/employees/new
 */
function EmployeeFormPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    department: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      setError("Name, email, and password are required.");
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

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Create Employee</h1>
          <p className="text-sm text-gray-500 mt-1">Register a new staff member account</p>
        </div>
        <Link
          to="/admin/employees"
          className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
        >
          &larr; Back to Directory
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6">
          <strong className="font-bold">Error:</strong> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Name Field */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="name" className="text-sm font-semibold text-gray-700">Full Name *</label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Jane Doe"
              className="px-3 py-2.5 border border-gray-200 rounded-md outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/15 transition"
              required
            />
          </div>

          {/* Email Field */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-semibold text-gray-700">Email Address *</label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="jane.doe@company.com"
              className="px-3 py-2.5 border border-gray-200 rounded-md outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/15 transition"
              required
            />
          </div>

          {/* Password Field */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm font-semibold text-gray-700">Temporary Password *</label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Minimum 6 characters"
              className="px-3 py-2.5 border border-gray-200 rounded-md outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/15 transition"
              required
              minLength="6"
            />
          </div>

          {/* Department Field */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="department" className="text-sm font-semibold text-gray-700">Department</label>
            <input
              id="department"
              name="department"
              type="text"
              value={formData.department}
              onChange={handleChange}
              placeholder="e.g. Sales, Support"
              className="px-3 py-2.5 border border-gray-200 rounded-md outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/15 transition"
            />
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end gap-3">
          <Link
            to="/admin/employees"
            className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-60 transition"
          >
            {isSubmitting ? "Creating..." : "Create Employee"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EmployeeFormPage;
