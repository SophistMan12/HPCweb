# HPCweb - Contact handler

This project is a static website with a small Express server to handle contact form submissions and send them via email using Nodemailer.

Setup

1. Copy `.env.example` to `.env` and fill in your SMTP credentials:

   - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`
   - Optionally `MAIL_TO` (defaults to `thienlenin12@gmail.com`) and `MAIL_FROM`.

2. Install dependencies:

   npm install

3. Run the server:

   npm start

The server serves the static files in the project root and exposes POST `/api/contact` which accepts JSON with the following shape:

{
  company, person, email, phone, zip, address, request
}

The server will send an email to `MAIL_TO` with the provided details.

Security note: don't commit your `.env` with credentials.
