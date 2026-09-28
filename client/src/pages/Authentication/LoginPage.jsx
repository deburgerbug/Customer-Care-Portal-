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
  const [showPassword, setShowPassword] = useState(false);
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
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-md bg-white text-gray-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 transition pr-10"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>
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
