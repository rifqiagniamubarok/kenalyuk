import nodemailer from 'nodemailer';

export type MailerClient = {
  transporter: nodemailer.Transporter;
  from: string;
};

export function createMailerClient(): MailerClient | null {
  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPassword = process.env.SMTP_PASSWORD || process.env.SMTP_PASS;
  const smtpFrom = process.env.SMTP_FROM || process.env.SMPTP_FROM;
  const smtpPortRaw = process.env.SMTP_PORT || '587';
  const smtpPort = Number.parseInt(smtpPortRaw, 10);
  const smtpSecure = process.env.SMTP_SECURE?.toLowerCase() === 'true';

  if (!smtpHost || !smtpUser || !smtpPassword || !smtpFrom) {
    console.warn('Email configuration incomplete. Set SMTP_HOST, SMTP_USER, SMTP_PASSWORD/SMTP_PASS, and SMTP_FROM/SMPTP_FROM in .env');
    return null;
  }

  if (!Number.isFinite(smtpPort)) {
    console.warn(`Invalid SMTP_PORT value: "${smtpPortRaw}". Falling back to 587.`);
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: Number.isFinite(smtpPort) ? smtpPort : 587,
    secure: smtpSecure,
    auth: {
      user: smtpUser,
      pass: smtpPassword,
    },
  });

  return {
    transporter,
    from: smtpFrom,
  };
}
