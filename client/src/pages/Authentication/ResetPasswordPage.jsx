import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { resetPassword } from "../../services/authAPI";

/**
 * ResetPasswordPage — Set New Password Screen
 *
 * Route: /reset-password/:token (public, accessed via email or dev helper link)
 * Used in: App.jsx as a public route
 *
 * Flow:
 *  1. Extracts cryptographic token from URL params (:token)
 *  2. User enters new password and password confirmation
 *  3. Validates matching passwords & minimum length (>= 6 characters)
 *  4. On submit → calls POST /auth/reset-password/:token
 *  5. On success → displays confirmation celebration banner and redirects to /login after 3 seconds
 */
function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();

  // Form field states
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    // Verify token exists in URL
    if (!token) {
      setError("Invalid or missing reset token.");
      return;
    }

    // Verify all fields are provided
    if (!password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    // Enforce password length
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    // Ensure password matches confirmation
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setIsSubmitting(true);
      await resetPassword(token, password);
      setSuccess(true);

      // Auto-redirect to login after 3 seconds
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(
        err.message || "Failed to reset password. The link may have expired."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    // Full-page centered layout for auth cards (matches LoginPage & ForgotPasswordPage)
    <div className="flex items-center justify-center min-h-[80vh] px-4">
      {/* Auth card — white box with subtle shadow and border */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-md p-8 sm:p-10 w-full max-w-md">
        {/* Page heading */}
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Set New Password</h1>
        <p className="text-sm text-gray-500 mb-6">
          Create a strong, secure new password for your account
        </p>

        {/* Error banner — displays if validation fails or token expired */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm mb-5">
            {error}
          </div>
        )}

        {/* Success View — rendered once password has been successfully updated */}
        {success ? (
          <div className="text-center py-6">
            <div className="text-4xl mb-2">🎉</div>
            <h3 className="text-lg font-bold text-green-700 mb-1">
              Password Reset Successful!
            </h3>
            <p className="text-sm text-gray-500 mb-5">
              Redirecting you to the sign in page in 3 seconds...
            </p>
            <Link
              to="/login"
              className="inline-block px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition"
            >
              Sign In Now
            </Link>
          </div>
        ) : (
          /* Password reset form */
          <form onSubmit={handleSubmit}>
            {/* New Password field */}
            <div className="flex flex-col gap-1.5 mb-4">
              <label
                htmlFor="newPassword"
                className="text-sm font-semibold text-gray-700"
              >
                New Password
              </label>
              <div className="relative">
                <input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 6 characters"
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
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  )}
                </button>
              </div>
            </div>

            {/* Confirm New Password field */}
            <div className="flex flex-col gap-1.5 mb-6">
              <label
                htmlFor="confirmPassword"
                className="text-sm font-semibold text-gray-700"
              >
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Re-enter your new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-md bg-white text-gray-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 transition pr-10"
                />
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

            {/* Submit button — disabled while submitting */}
            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Updating Password..." : "Update Password"}
            </button>
          </form>
        )}

        {/* Back to login footer — hidden if already succeeded */}
        {!success && (
          <p className="text-center text-sm text-gray-500 mt-6">
            Remembered your credentials?{" "}
            <Link to="/login" className="text-blue-600 hover:underline font-medium">
              Back to Sign In
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}

export default ResetPasswordPage;
