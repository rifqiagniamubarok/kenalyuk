/**
 * Notification utilities for user status updates
 * Sends email notifications for approval/rejection decisions
 */

import nodemailer from 'nodemailer';

/**
 * Create nodemailer transporter with SMTP configuration
 */
function createTransporter() {
  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPassword = process.env.SMTP_PASSWORD;
  const smtpFrom = process.env.SMTP_FROM;

  if (!smtpHost || !smtpUser || !smtpPassword || !smtpFrom) {
    console.warn('Email configuration incomplete. Set SMTP_HOST, SMTP_USER, SMTP_PASSWORD, and SMTP_FROM in .env');
    return null;
  }

  return nodemailer.createTransport({
    host: smtpHost,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: smtpUser,
      pass: smtpPassword,
    },
  });
}

/**
 * Send approval notification to user
 * @param email - User email address
 * @param userName - User's display name
 */
export async function sendApprovalNotification(email: string, userName: string): Promise<{ success: boolean; message: string }> {
  try {
    const transporter = createTransporter();

    if (!transporter) {
      console.warn('Email service not configured - notification not sent');
      return {
        success: false,
        message: 'Email service not configured',
      };
    }

    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const dashboardUrl = `${baseUrl}/dashboard`;

    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: 'Your Profile Has Been Approved - Kenalyuk!',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Kenalyuk!</h1>
              <p style="color: #f0f0f0; margin: 10px 0 0 0;">Syariah-Compliant Matchmaking</p>
            </div>
            
            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
              <h2 style="color: #22c55e; margin-top: 0;">✓ Profile Approved!</h2>
              
              <p>Assalamu'alaikum ${userName},</p>
              
              <p>Great news! Your profile has been reviewed and approved by our supervisor. You can now start discovering and connecting with other users on Kenalyuk!</p>
              
              <div style="background: #e8f5e9; border-left: 4px solid #22c55e; padding: 15px; margin: 20px 0;">
                <strong>What's Next?</strong>
                <ul style="margin: 10px 0;">
                  <li>Your profile is now visible to other users</li>
                  <li>You can browse and like other profiles</li>
                  <li>Start your journey to find your life partner</li>
                </ul>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${dashboardUrl}" 
                   style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                          color: white; 
                          padding: 15px 40px; 
                          text-decoration: none; 
                          border-radius: 5px; 
                          font-weight: bold;
                          display: inline-block;">
                  Go to Dashboard
                </a>
              </div>
              
              <p style="color: #666; font-size: 14px;">
                Remember to maintain Islamic principles in all your interactions. May Allah guide you to find the right partner.
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
              <p>© 2026 Kenalyuk! - Syariah-Compliant Matchmaking Platform</p>
            </div>
          </body>
        </html>
      `,
      text: `
Profile Approved - Kenalyuk!

Assalamu'alaikum ${userName},

Great news! Your profile has been reviewed and approved by our supervisor. You can now start discovering and connecting with other users on Kenalyuk!

What's Next?
- Your profile is now visible to other users
- You can browse and like other profiles
- Start your journey to find your life partner

Visit your dashboard: ${dashboardUrl}

Remember to maintain Islamic principles in all your interactions. May Allah guide you to find the right partner.

© 2026 Kenalyuk! - Syariah-Compliant Matchmaking Platform
      `,
    });

    return { success: true, message: 'Approval notification sent successfully' };
  } catch (error) {
    console.error('Error sending approval notification:', error);
    return {
      success: false,
      message: 'Failed to send notification',
    };
  }
}

/**
 * Send rejection notification to user
 * @param email - User email address
 * @param userName - User's display name
 * @param reason - Rejection reason provided by supervisor
 */
export async function sendRejectionNotification(email: string, userName: string, reason: string): Promise<{ success: boolean; message: string }> {
  try {
    const transporter = createTransporter();

    if (!transporter) {
      console.warn('Email service not configured - notification not sent');
      return {
        success: false,
        message: 'Email service not configured',
      };
    }

    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const biodataUrl = `${baseUrl}/biodata`;

    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: 'Profile Review Update - Kenalyuk!',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Kenalyuk!</h1>
              <p style="color: #f0f0f0; margin: 10px 0 0 0;">Syariah-Compliant Matchmaking</p>
            </div>
            
            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
              <h2 style="color: #ef4444; margin-top: 0;">Profile Review Update</h2>
              
              <p>Assalamu'alaikum ${userName},</p>
              
              <p>Thank you for your interest in Kenalyuk! After reviewing your profile, our supervisor has requested some changes before approval.</p>
              
              <div style="background: #fee; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0;">
                <strong>Feedback from Supervisor:</strong>
                <p style="margin: 10px 0;">${reason}</p>
              </div>
              
              <div style="background: #e3f2fd; border-left: 4px solid #2196f3; padding: 15px; margin: 20px 0;">
                <strong>What to Do Next?</strong>
                <ul style="margin: 10px 0;">
                  <li>Review the feedback carefully</li>
                  <li>Update your profile accordingly</li>
                  <li>Your profile will be reviewed again after updates</li>
                </ul>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${biodataUrl}" 
                   style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                          color: white; 
                          padding: 15px 40px; 
                          text-decoration: none; 
                          border-radius: 5px; 
                          font-weight: bold;
                          display: inline-block;">
                  Update Profile
                </a>
              </div>
              
              <p style="color: #666; font-size: 14px;">
                We're here to help you create the best profile possible. If you have questions, please contact our support team.
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
              <p>© 2026 Kenalyuk! - Syariah-Compliant Matchmaking Platform</p>
            </div>
          </body>
        </html>
      `,
      text: `
Profile Review Update - Kenalyuk!

Assalamu'alaikum ${userName},

Thank you for your interest in Kenalyuk! After reviewing your profile, our supervisor has requested some changes before approval.

Feedback from Supervisor:
${reason}

What to Do Next?
- Review the feedback carefully
- Update your profile accordingly
- Your profile will be reviewed again after updates

Update your profile: ${biodataUrl}

We're here to help you create the best profile possible. If you have questions, please contact our support team.

© 2026 Kenalyuk! - Syariah-Compliant Matchmaking Platform
      `,
    });

    return { success: true, message: 'Rejection notification sent successfully' };
  } catch (error) {
    console.error('Error sending rejection notification:', error);
    return {
      success: false,
      message: 'Failed to send notification',
    };
  }
}
