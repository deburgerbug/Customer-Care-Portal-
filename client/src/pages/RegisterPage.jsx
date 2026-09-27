import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../services/authAPI";
import { useAuth } from "../context/AuthContext";

/**
 * RegisterPage — New user registration screen
 *
 * Route: /register (public, no auth required)
 * Used in: App.jsx as a public route
 *
 * Flow:
 *  1. User enters name, email, password, confirm password
 *  2. Client-side validation (required fields, min length, password match)
 *  3. On submit → calls registerUser API (registers as "customer" role by default)
 *  4. On success → saves tokens via AuthContext and redirects to /
 *  5. On error → shows error message above the form
 */
function RegisterPage() {
  const navigate = useNavigate();
  const { saveAuth } = useAuth();

  // Form field states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    // Validate all fields are filled
    if (!name.trim() || !email.trim() || !password) {
      setError("All fields are required");
      return;
    }

    // Minimum password length check (matches backend's User schema minlength: 6)
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    // Confirm password match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setIsSubmitting(true);
      // Call POST /auth/register → returns { message, user }
      const data = await registerUser({ name, email, password });
      
      // We don't save auth or navigate away immediately.
      // Instead, we show the success message (e.g. check your email to verify).
      setSuccessMsg(data.message || "Registration successful. Please check your email to verify your account.");
      
      // Clear form
      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");

    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  // Reusable Tailwind classes for input fields (same style across all fields)
  const inputStyles = "w-full px-3 py-2.5 border border-gray-200 rounded-md bg-white text-gray-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 transition";

  return (
    // Full-page centered layout — same layout as LoginPage
    <div className="flex items-center justify-center min-h-[80vh] px-4">

      {/* Auth card — white box with shadow */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-md p-10 w-full max-w-md">

        {/* Page heading */}
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Create Account</h1>
        <p className="text-sm text-gray-500 mb-7">Register for Customer Care Portal</p>

        {/* Error message banner — shows validation or API errors */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm mb-5">
            {error}
          </div>
        )}

        {/* Success message banner */}
        {successMsg && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm mb-5">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Full Name field */}
          <div className="flex flex-col gap-1.5 mb-4">
            <label htmlFor="name" className="text-sm font-semibold text-gray-700">Full Name</label>
            <input id="name" type="text" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} className={inputStyles} />
          </div>

          {/* Email field */}
          <div className="flex flex-col gap-1.5 mb-4">
            <label htmlFor="email" className="text-sm font-semibold text-gray-700">Email</label>
            <input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className={inputStyles} />
          </div>

          {/* Password field */}
          <div className="flex flex-col gap-1.5 mb-4">
            <label htmlFor="password" className="text-sm font-semibold text-gray-700">Password</label>
            <input id="password" type="password" placeholder="At least 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} className={inputStyles} />
          </div>

          {/* Confirm Password field */}
          <div className="flex flex-col gap-1.5 mb-6">
            <label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700">Confirm Password</label>
            <input id="confirmPassword" type="password" placeholder="Re-enter your password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={inputStyles} />
          </div>

          {/* Submit button — full width, disabled while API call is in progress */}
          <button
            type="submit"
            className="w-full py-2.5 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        {/* Link to login page */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 hover:underline">Sign in here</Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
