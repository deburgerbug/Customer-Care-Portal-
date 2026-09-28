import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../../services/authAPI";
import { useAuth } from "../../context/AuthContext";

/**
 * LoginPage — User sign-in screen
 *
 * Route: /login (public, no auth required)
 * Used in: App.jsx as a public route
 *
 * Flow:
 *  1. User enters email + password
 *  2. On submit → calls loginUser API
 *  3. On success → saves tokens via AuthContext and redirects to /
 *  4. On error → shows error message above the form
 */
function LoginPage() {
  const navigate = useNavigate();
  const { saveAuth } = useAuth();

  // Form field states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    // Basic client-side check before calling API
    if (!email.trim() || !password) {
      setError("Email and password are required");
      return;
    }

    try {
      setIsSubmitting(true);
      // Call POST /auth/login → returns { user, accessToken, refreshToken }
      const data = await loginUser({ email, password });
      // Save tokens to localStorage + update AuthContext state
      saveAuth(data);

      // Smart Routing based on role
      const role = data.user?.role;
      if (role === "admin") {
        navigate("/admin/customers");
      } else if (role === "employee") {
        navigate("/employee/customers");
      } else {
        navigate("/customer/profile");
      }
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    // Full-page centered layout for auth forms
    <div className="flex items-center justify-center min-h-[80vh] px-4">

      {/* Auth card — white box with shadow */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-md p-10 w-full max-w-md">

        {/* Page heading */}
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome Back</h1>
        <p className="text-sm text-gray-500 mb-7">Sign in to Customer Care Portal</p>

        {/* Error message banner — only visible when there's an error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm mb-5">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Email field */}
          <div className="flex flex-col gap-1.5 mb-4">
            <label htmlFor="email" className="text-sm font-semibold text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="px-3 py-2.5 border border-gray-200 rounded-md bg-white text-gray-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 transition"
            />
          </div>

          {/* Password field with forgot password link */}
          <div className="flex flex-col gap-1.5 mb-6">
            <div className="flex justify-between items-center">
              <label htmlFor="password" className="text-sm font-semibold text-gray-700">
                Password
              </label>
              <Link to="/forgot-password" className="text-sm text-indigo-500 hover:text-indigo-700 no-underline">
                Forgot password?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="px-3 py-2.5 border border-gray-200 rounded-md bg-white text-gray-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 transition"
            />
          </div>

          {/* Submit button — full width, disabled while API call is in progress */}
          <button
            type="submit"
            className="w-full py-2.5 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* Link to registration page */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account?{" "}
          <Link to="/register" className="text-blue-600 hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
