import { useState } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { resetPassword } from "../services/authAPI"
function ResetPasswordPage(){
    const {token} = useParams()
    const navigate = useNavigate()

    const[password, setPassword] = useState("");
    const[confirmPassword, setConfirmPassword] = useState("");
    const[error, setError] = useState("");
    const[success, setSuccess] = useState(false);
    const[isSubmitting, setIsSubmitting] = useState(false);

    async function handleSubmit(e){
        e.preventDefault();
        setError("")

        if(!token){
            setError("Invalid or missing reset token")
            return;
        }
        if(!password){
            setPassword("Please fill in the all fields")
            return;
        }
        if(password.length < 6){
            setError("Password must be at least 6 cahracters")
            return;
        }

        try{
            setIsSubmitting(true);
            await resetPassword(token, password);
            setSuccess(true);
            setTimeout(() => navigate("/login"), 3000);
        }
        catch(err){
            setError(err.message || "failed to resety password. Link may have expired")
        }
        finally{
            setIsSubmitting(false);
        }
    }
    return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Set New Password</h1>
        <p className="auth-subtitle">Create a strong, secure new password</p>
        {error && <div className="error-banner">{error}</div>}
        {success ? (
          <div style={{ textAlign: "center", padding: "1.5rem 0" }}>
            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🎉</div>
            <h3 style={{ color: "#16a34a", marginBottom: "0.5rem" }}>
              Password Reset Successful!
            </h3>
            <p style={{ color: "#64748b", fontSize: "0.9rem" }}>
              Redirecting you to the login page in 3 seconds...
            </p>
            <Link
              to="/login"
              className="btn btn-primary"
              style={{ display: "inline-block", marginTop: "1rem" }}
            >
              Go to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <input
                id="newPassword"
                type="password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <input
                id="confirmPassword"
                type="password"
                placeholder="Re-enter your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary auth-submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Updating..." : "Update Password"}
            </button>
          </form>
        )}
        {!success && (
          <p className="auth-footer-text">
            Remember your credentials? <Link to="/login">Back to Sign In</Link>
          </p>
        )}
      </div>
    </div>
  );
}
export default ResetPasswordPage;

