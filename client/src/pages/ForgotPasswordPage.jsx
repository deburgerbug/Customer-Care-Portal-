import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../services/authAPI";

/**
 * ForgotPasswordPage — Request Password Reset Screen
 *
 * Route: /forgot-password (public, no auth required)
 * Used in: App.jsx as a public route
 *
 * Flow:
 *  1. User enters their registered email
 *  2. On submit → calls POST /auth/forgot-password via forgotPassword(email)
 *  3. Backend generates cryptographic token (15-min TTL) & sends email via Nodemailer
 *  4. Shows confirmation banner (and a dev helper link when running locally)
 *  5. User can click "Back to Sign In" to return to /login
 */
function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    // Validate email is not empty
    if (!email.trim()) {
      setError("Please enter your registered email address");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await forgotPassword(email.trim());
      setMessage(
        res.message || "Password reset instructions have been sent to your email."
      );

      // Dev Helper: Backend returns resetToken for quick local testing without checking Gmail
      if (res.resetToken) {
        setResetToken(res.resetToken);
      }
    } catch (err) {
      setError(err.message || "Failed to process password reset request");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    // Full-page centered layout for auth cards (matches LoginPage.jsx)
    <div className="flex items-center justify-center min-h-[80vh] px-4">
      {/* Auth card — white box with subtle shadow and border */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-md p-8 sm:p-10 w-full max-w-md">
        {/* Page heading */}
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Reset Password</h1>
        <p className="text-sm text-gray-500 mb-6">
          Enter your email to receive password reset instructions
        </p>

        {/* Error banner — displays if email missing or API failure */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm mb-5">
            {error}
          </div>
        )}

        {/* Success message banner — displays upon email dispatch */}
        {message && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm mb-5 text-center">
            {message}
          </div>
        )}

        {/* Development Helper: Direct link to test reset page without opening inbox */}
        {resetToken && (
          <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-lg mb-5 text-sm text-emerald-800">
            <p className="font-semibold text-xs text-emerald-900">
              🛠️ Local Dev Helper:
            </p>
            <p className="text-xs text-emerald-700 mt-0.5">
              Click below to test the reset password screen:
            </p>
            <Link
              to={`/reset-password/${resetToken}`}
              className="text-indigo-600 hover:text-indigo-800 font-semibold text-xs break-all underline mt-1.5 block"
            >
              Open Reset Form &rarr;
            </Link>
          </div>
        )}

        {/* Reset request form */}
        <form onSubmit={handleSubmit}>
          {/* Email input field */}
          <div className="flex flex-col gap-1.5 mb-6">
            <label
              htmlFor="email"
              className="text-sm font-semibold text-gray-700"
            >
              Registered Email
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

          {/* Submit button — disabled during API dispatch */}
          <button
            type="submit"
            className="w-full py-2.5 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Sending Link..." : "Send Reset Link"}
          </button>
        </form>

        {/* Return to login link */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Remembered your password?{" "}
          <Link to="/login" className="text-blue-600 hover:underline font-medium">
            Back to Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
