/**
 * Notification utilities for user status updates
 * Sends email notifications for approval/rejection decisions
 */

import { createMailerClient } from './mailer';
import { renderEmailTemplate } from './email-template';

/**
 * Send approval notification to user
 * @param email - User email address
 * @param userName - User's display name
 */
export async function sendApprovalNotification(email: string, userName: string): Promise<{ success: boolean; message: string }> {
  try {
    const mailer = createMailerClient();

    if (!mailer) {
      console.warn('Email service not configured - notification not sent');
      return {
        success: false,
        message: 'Email service not configured',
      };
    }

    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const dashboardUrl = `${baseUrl}/dashboard`;
    const html = await renderEmailTemplate('approval', {
      userName,
      dashboardUrl,
      year: new Date().getFullYear(),
    });

    await mailer.transporter.sendMail({
      from: mailer.from,
      to: email,
      subject: 'Your Profile Has Been Approved - Kenalyuk!',
      html,
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

© ${new Date().getFullYear()} Kenalyuk! - Syariah-Compliant Matchmaking Platform
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
    const mailer = createMailerClient();

    if (!mailer) {
      console.warn('Email service not configured - notification not sent');
      return {
        success: false,
        message: 'Email service not configured',
      };
    }

    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const biodataUrl = `${baseUrl}/biodata`;
    const html = await renderEmailTemplate('rejection', {
      userName,
      reason,
      biodataUrl,
      year: new Date().getFullYear(),
    });

    await mailer.transporter.sendMail({
      from: mailer.from,
      to: email,
      subject: 'Profile Review Update - Kenalyuk!',
      html,
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

© ${new Date().getFullYear()} Kenalyuk! - Syariah-Compliant Matchmaking Platform
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
