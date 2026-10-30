import nodemailer from 'nodemailer';

let transporter;

function getTransporter() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD } = process.env;

  if (!SMTP_HOST) {
    throw new Error('SMTP_HOST is not configured');
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE,
      auth: SMTP_USER
        ? { user: SMTP_USER, pass: SMTP_PASSWORD }
        : undefined
    });
  }

  return transporter;
}

export async function sendOtpEmail(to, code) {
  const from = process.env.SMTP_USER;

  if (!from) {
    throw new Error('SMTP_USER is not configured');
  }

  await getTransporter().sendMail({
    from,
    to,
    subject: 'Kod weryfikacyjny',
    text: `Twój kod weryfikacyjny to ${code}. Kod jest ważny przez 5 minut.`,
    html: `<p>Twój kod weryfikacyjny to <strong>${code}</strong>.</p><p>Kod jest ważny przez 5 minut.</p>`
  });
}
