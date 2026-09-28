import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { verifyEmail } from "../../services/authAPI";

/**
 * VerifyEmailPage — Handles email verification via token link
 *
 * Route: /verify-email/:token (public)
 * Used in: App.jsx as a public route
 *
 * Flow:
 *  1. Extracts token from URL.
 *  2. On mount, calls POST /auth/verify-email/:token.
 *  3. Displays loading, success, or error state based on response.
 */
function VerifyEmailPage() {
  const { token } = useParams();
  const [status, setStatus] = useState("loading"); // 'loading', 'success', 'error'
  const [message, setMessage] = useState("");
  const calledRef = useRef(false);

  useEffect(() => {
    // Prevent strict mode double execution from making duplicate API calls
    if (calledRef.current) return;
    calledRef.current = true;

    async function handleVerify() {
      try {
        const data = await verifyEmail(token);
        setStatus("success");
        setMessage(data.message || "Email verified successfully!");
      } catch (err) {
        setStatus("error");
        setMessage(err.message || "Invalid or expired verification token.");
      }
    }

    if (token) {
      handleVerify();
    } else {
      setStatus("error");
      setMessage("No verification token provided.");
    }
  }, [token]);

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4">
      <div className="bg-white border border-gray-200 rounded-xl shadow-md p-10 w-full max-w-md text-center">

        {status === "loading" && (
          <>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Verifying Email...</h1>
            <p className="text-gray-500">Please wait while we verify your account.</p>
            <div className="mt-6 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          </>
        )}

        {status === "success" && (
          <>
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Email Verified</h1>
            <p className="text-gray-500 mb-6">{message}</p>
            <Link
              to="/login"
              className="inline-block w-full py-2.5 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition"
            >
              Go to Login
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h1>
            <p className="text-red-600 mb-6">{message}</p>
            <Link
              to="/register"
              className="inline-block w-full py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-md hover:bg-gray-200 transition"
            >
              Back to Registration
            </Link>
          </>
        )}

      </div>
    </div>
  );
}

export default VerifyEmailPage;
