import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_Host || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_Port || '587'),
  secure: process.env.Encryption === 'SSL' || process.env.SMTP_Port === '465',
  auth: {
    user: process.env.From_Email || process.env.Username, // Typically SMTP requires the actual email as user, or specific username
    pass: process.env.Password,
  },
});

export const sendInviteEmail = async (to: string, inviteLink: string, workspaceName: string, inviterName: string) => {
  const fromName = process.env.From_Name || 'Httply';
  const fromEmail = process.env.From_Email || process.env.Username;

  const mailOptions = {
    from: `"${fromName}" <${fromEmail}>`,
    to,
    subject: `You have been invited to join ${workspaceName} on Httply`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px;">
        <h2 style="color: #333;">Welcome to Httply!</h2>
        <p style="color: #555; line-height: 1.5;">
          <strong>${inviterName}</strong> has invited you to join their workspace <strong>${workspaceName}</strong>.
        </p>
        <p style="color: #555; line-height: 1.5;">
          <strong>Important:</strong> Please ensure you are logged into your Httply account first, then click the button below to accept the invitation and join the workspace:
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${inviteLink}" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            Accept Invitation
          </a>
        </div>
        <p style="color: #888; font-size: 12px; margin-top: 40px; text-align: center;">
          If you didn't expect this invitation, you can safely ignore this email.
        </p>
      </div>
    `,
  };

  return await transporter.sendMail(mailOptions);
};

export const sendWelcomeEmail = async (to: string, userName: string) => {
  const fromName = process.env.From_Name || 'Httply';
  const fromEmail = process.env.From_Email || process.env.Username;

  const mailOptions = {
    from: `"${fromName}" <${fromEmail}>`,
    to,
    subject: `Welcome to Httply, ${userName}!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px;">
        <h2 style="color: #333;">Welcome to Httply!</h2>
        <p style="color: #555; line-height: 1.5;">
          Hi <strong>${userName}</strong>,
        </p>
        <p style="color: #555; line-height: 1.5;">
          Thank you for joining Httply! We're thrilled to have you on board.
        </p>
        <p style="color: #555; line-height: 1.5;">
          Httply is built to streamline your API testing and collaboration. You can now start creating workspaces, organizing your API collections, and testing your endpoints with ease!
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://httply.com'}/dashboard" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            Go to Dashboard
          </a>
        </div>
        <p style="color: #888; font-size: 12px; margin-top: 40px; text-align: center;">
          If you have any questions, simply reply to this email. We're here to help!
        </p>
      </div>
    `,
  };

  return await transporter.sendMail(mailOptions);
};
