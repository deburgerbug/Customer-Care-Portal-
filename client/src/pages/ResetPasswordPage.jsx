import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { resetPassword } from "../services/authAPI";

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
              <input
                id="newPassword"
                type="password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="px-3 py-2.5 border border-gray-200 rounded-md bg-white text-gray-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 transition"
              />
            </div>

            {/* Confirm New Password field */}
            <div className="flex flex-col gap-1.5 mb-6">
              <label
                htmlFor="confirmPassword"
                className="text-sm font-semibold text-gray-700"
              >
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                placeholder="Re-enter your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="px-3 py-2.5 border border-gray-200 rounded-md bg-white text-gray-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 transition"
              />
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
