import nodemailer from "nodemailer";

function getTransporter() {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    throw new Error(
      "Email credentials missing. Please set EMAIL_USER and EMAIL_PASS in backend/.env"
    );
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
}

/**
 * Sends a password reset email with a secure link
 * @param {Object} options
 * @param {string} options.to - Recipient email address
 * @param {string} options.resetUrl - Full frontend URL to reset password
 * @param {string} [options.name] - Recipient name
 */
export async function sendPasswordResetEmail({ to, resetUrl, name }) {
  const transporter = getTransporter();

  const recipientName = name || "Valued User";

  const mailOptions = {
    from: `"Customer Care Portal" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Password Reset Request — Customer Care Portal",
    text: `Hello ${recipientName},\n\nYou requested to reset your password.\nPlease open the link below to set a new password:\n\n${resetUrl}\n\nThis link is valid for 15 minutes. If you did not request this, please ignore this email.\n\nBest regards,\nCustomer Care Team`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #1e293b; margin-top: 0;">Password Reset Request</h2>
        <p style="color: #475569; font-size: 15px; line-height: 1.6;">
          Hello <strong>${recipientName}</strong>,
        </p>
        <p style="color: #475569; font-size: 15px; line-height: 1.6;">
          We received a request to reset your password for your <strong>Customer Care Portal</strong> account. Click the button below to choose a new password:
        </p>

        <div style="text-align: center; margin: 32px 0;">
          <a href="${resetUrl}" style="background-color: #4f46e5; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; display: inline-block;">
            Reset My Password
          </a>
        </div>

        <p style="color: #64748b; font-size: 13px; line-height: 1.5;">
          This link will expire in <strong>15 minutes</strong>. If you did not request a password reset, you can safely ignore this email — your account remains secure.
        </p>

        <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;" />

        <p style="color: #94a3b8; font-size: 12px; line-height: 1.5;">
          If the button above does not work, copy and paste this URL into your browser:<br/>
          <a href="${resetUrl}" style="color: #6366f1; word-break: break-all;">${resetUrl}</a>
        </p>
      </div>
    `,
  };

  return await transporter.sendMail(mailOptions);
}
