import { useState } from 'react'
import { Link } from 'react-router-dom'
import { forgotPassword } from '../services/authAPI'

function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [message, setMessage] = useState("")
    const [resetToken, setResetToken] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setMessage("")
        if (!email.trim()) {
            setError("Enter your registered email");
            return;
        }

        try {
            setIsSubmitting(true);
            const res = await forgotPassword(email.trim())
            setMessage(res.message || "Password reset insetructions sent")
            if (res.resetToken) {
                setResetToken(res.resetToken);
            }

        }catch(err){
            setError(err.message || "Failed to reset password ")
        }finally{
            setIsSubmitting(false)
        }
    }
    return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Reset Password</h1>
        <p className="auth-subtitle">
          Enter your email to receive password reset instructions
        </p>
        {error && <div className="error-banner">{error}</div>}
        {message && <div className="success-banner" style={{ color: "#16a34a", marginBottom: "1rem", textAlign: "center" }}>{message}</div>}
        
        {resetToken && (
          <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "12px", borderRadius: "8px", marginBottom: "1rem" }}>
            <p style={{ margin: 0, fontSize: "0.85rem", color: "#15803d" }}>
              <strong>Dev Helper:</strong> Click below to test the reset page:
            </p>
            <Link
              to={`/reset-password/${resetToken}`}
              style={{ color: "#4f46e5", fontWeight: "600", fontSize: "0.85rem", wordBreak: "break-all" }}
            >
              Open Reset Form &rarr;
            </Link>
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary auth-submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Sending Link..." : "Send Reset Link"}
          </button>
        </form>
        <p className="auth-footer-text">
          Remembered your password? <Link to="/login">Back to Sign In</Link>
        </p>
      </div>
    </div>
  );
}
export default ForgotPasswordPage;






