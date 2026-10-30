import nodemailer from 'nodemailer';

let transporter;

function getTransporter() {
  if (transporter) return transporter;

  const required = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASSWORD'];
  const missing = required.filter((name) => !process.env[name]);
  if (missing.length) {
    throw new Error(`Missing SMTP configuration: ${missing.join(', ')}`);
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD
    }
  });
};

export async function verifyEmailConnection() {
  await getTransporter().verify();
}

export async function sendOtpEmail(receiver, code) {
  await getTransporter().sendMail({
    from: process.env.SMTP_USER,
    to: receiver,
    subject: 'Kod weryfikacyjny',
    text: `Twój kod weryfikacyjny to ${code}. Kod jest ważny przez 5 minut.`,
    html: `<p>Twój kod weryfikacyjny to <strong>${code}</strong>.</p><p>Kod jest ważny przez 5 minut.</p>`
  });
}
