import { useState, useEffect } from "react";
import { calculateAge } from "../../utils/calculateAge";
import { useAuth } from "../../context/AuthContext";
import { getEmployees } from "../../services/userAPI";

/**
 * BasicInformation — First section of the CustomerForm
 *
 * Used in: CustomerForm.jsx — renders at the top of create/edit forms
 *
 * Props:
 *  - customer: the customer object (firstName, lastName, gender, dob)
 *  - onChange: event handler from CustomerForm that updates state
 *  - errors: validation error messages keyed by field name (e.g. { firstName: "Required" })
 *
 * Fields: First Name, Last Name, Gender (select), Date of Birth (date picker), Age (auto-calculated, read-only)
 */
function BasicInformation({ customer, onChange, errors = {} }) {
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);

  // Fetch employees if user is an admin
  useEffect(() => {
    async function fetchEmployees() {
      if (user?.role === "admin") {
        try {
          const res = await getEmployees();
          setEmployees(res.data || []);
        } catch (err) {
          console.error("Failed to fetch employees:", err);
        }
      }
    }
    fetchEmployees();
  }, [user]);

  // Calculate age from DOB using the calculateAge utility (returns "3 years", "2 months, 5 days", etc.)
  const age = customer.dob ? calculateAge(customer.dob) : "";

  // Reusable Tailwind classes for text inputs and selects
  const baseInputStyles = "w-full px-3 py-2.5 border rounded-md bg-white text-gray-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 transition";
  // Error state adds red border + light red background
  const errorInputStyles = "border-red-500 bg-red-50";
  // Normal state has gray border
  const normalInputStyles = "border-gray-200";

  return (
    // Card wrapper — white bordered box with padding and shadow
    <section className="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm">

      {/* Section title — separated by a bottom border */}
      <div className="mb-5 pb-3 border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-900">Customer Basic Information</h2>
      </div>

      {/* Form grid — auto-fits columns with min 220px width */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

        {/* First Name field */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="firstName" className="text-sm font-semibold text-gray-700">First Name *</label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            placeholder="Enter first name"
            value={customer.firstName}
            onChange={onChange}
            className={`${baseInputStyles} ${errors.firstName ? errorInputStyles : normalInputStyles}`}
          />
          {errors.firstName && <span className="text-xs font-medium text-red-600">{errors.firstName}</span>}
        </div>

        {/* Last Name field */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="lastName" className="text-sm font-semibold text-gray-700">Last Name *</label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            placeholder="Enter last name"
            value={customer.lastName}
            onChange={onChange}
            className={`${baseInputStyles} ${errors.lastName ? errorInputStyles : normalInputStyles}`}
          />
          {errors.lastName && <span className="text-xs font-medium text-red-600">{errors.lastName}</span>}
        </div>

        {/* Gender dropdown */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="gender" className="text-sm font-semibold text-gray-700">Gender *</label>
          <select
            id="gender"
            name="gender"
            value={customer.gender}
            onChange={onChange}
            className={`${baseInputStyles} ${errors.gender ? errorInputStyles : normalInputStyles}`}
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Prefer Not to say">Prefer Not to say</option>
          </select>
          {errors.gender && <span className="text-xs font-medium text-red-600">{errors.gender}</span>}
        </div>

        {/* Date of Birth — max is today's date to prevent future dates */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="dob" className="text-sm font-semibold text-gray-700">Date of Birth *</label>
          <input
            id="dob"
            name="dob"
            type="date"
            max={new Date().toLocaleDateString("en-CA")}
            value={customer.dob}
            onChange={onChange}
            className={`${baseInputStyles} ${errors.dob ? errorInputStyles : normalInputStyles}`}
          />
          {errors.dob && <span className="text-xs font-medium text-red-600">{errors.dob}</span>}
        </div>

        {/* Age — read-only, auto-calculated from DOB, not editable by user */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="age" className="text-sm font-semibold text-gray-700">Age (Auto-calculated)</label>
          <input
            id="age"
            type="text"
            value={age || ""}
            readOnly
            placeholder="Calculated from DOB"
            className={`${baseInputStyles} border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed`}
          />
        </div>

        {/* Assigned Employee Dropdown (Admin Only) */}
        {user?.role === "admin" && (
          <div className="flex flex-col gap-1.5">
            <label htmlFor="assignedTo" className="text-sm font-semibold text-gray-700">Assign to Employee</label>
            <select
              id="assignedTo"
              name="assignedTo"
              value={customer.assignedTo || ""}
              onChange={onChange}
              className={`${baseInputStyles} ${errors.assignedTo ? errorInputStyles : normalInputStyles}`}
            >
              <option value="">Unassigned (Admin only view)</option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.name} ({emp.email})
                </option>
              ))}
            </select>
            {errors.assignedTo && <span className="text-xs font-medium text-red-600">{errors.assignedTo}</span>}
          </div>
        )}
      </div>
    </section>
  );
}

export default BasicInformation;