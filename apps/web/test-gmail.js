const nodemailer = require('nodemailer');

async function sendTest() {
  const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false,
    auth: {
      user: 'b4e33a001@smtp-brevo.com',
      pass: process.env.SMTP_PASSWORD,
    },
  });

  try {
    const info = await transporter.sendMail({
      from: '"Talora Platform" <b4e33a001@smtp-brevo.com>',
      to: 'leon.nsittakalungi@students.mak.ac.ug',
      subject: 'Talora Verification Test',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Talora System Test</h2>
          <p>Hello Leon,</p>
          <p>This is a manual test email sent directly from the server to verify that Brevo is successfully delivering emails to your Gmail inbox.</p>
          <p>If you are reading this, the email verification system works!</p>
          <p>Best,<br>Talora System</p>
        </div>
      `,
    });
    console.log("Test email accepted by Brevo! Message ID:", info.messageId);
  } catch (err) {
    console.error("Failed to send email:", err);
  }
}

sendTest();
