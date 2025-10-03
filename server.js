require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files (the website)
app.use(express.static(path.join(__dirname)));

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT;
const SMTP_SECURE = process.env.SMTP_SECURE === 'true';
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const MAIL_TO = process.env.MAIL_TO || 'thienlenin12@gmail.com';
const MAIL_FROM = process.env.MAIL_FROM || 'HPC Contact <no-reply@hpc.com>';

if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
  console.warn('Warning: SMTP credentials are not fully configured. Email sending will fail until .env is set.');
}

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT ? parseInt(SMTP_PORT, 10) : undefined,
  secure: SMTP_SECURE,
  auth: SMTP_USER && SMTP_PASS ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
});

app.post('/api/contact', async (req, res) => {
  const { company, person, email, phone, zip, address, request } = req.body || {};
  if (!company || !person || !email) {
    return res.status(400).json({ ok: false, error: 'Missing required fields' });
  }

  const html = `
    <h2>Yêu cầu liên hệ từ website HPC</h2>
    <p><strong>Công ty:</strong> ${escapeHtml(company)}</p>
    <p><strong>Người liên hệ:</strong> ${escapeHtml(person)}</p>
    <p><strong>Email:</strong> ${escapeHtml(email)}</p>
    <p><strong>Điện thoại:</strong> ${escapeHtml(phone || '')}</p>
    <p><strong>Mã bưu chính:</strong> ${escapeHtml(zip || '')}</p>
    <p><strong>Địa chỉ:</strong> ${escapeHtml(address || '')}</p>
    <p><strong>Nội dung yêu cầu:</strong><br/>${escapeHtml(request || '')}</p>
    <hr/>
    <p>Thời gian: ${new Date().toLocaleString()}</p>
  `;

  try {
    const info = await transporter.sendMail({
      from: MAIL_FROM,
      to: MAIL_TO,
      subject: `Yêu cầu liên hệ từ ${company} - ${person}`,
      html,
      replyTo: email
    });
    console.log('Email sent:', info && info.messageId);
    return res.json({ ok: true });
  } catch (err) {
    console.error('Error sending email', err);
    return res.status(500).json({ ok: false, error: 'Failed to send email' });
  }
});

// fallback for SPA/static site
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
