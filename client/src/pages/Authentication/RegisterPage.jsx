import { useState } from "react";
import { Link } from "react-router-dom";
import { registerUser } from "../../services/authAPI";

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
  // Form field states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
            <div className="relative">
              <input id="password" type={showPassword ? "text" : "password"} placeholder="At least 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} className={`${inputStyles} pr-10`} />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password field */}
          <div className="flex flex-col gap-1.5 mb-6">
            <label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700">Confirm Password</label>
            <div className="relative">
              <input id="confirmPassword" type={showConfirmPassword ? "text" : "password"} placeholder="Re-enter your password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={`${inputStyles} pr-10`} />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                tabIndex="-1"
              >
                {showConfirmPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
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
