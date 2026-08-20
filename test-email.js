const nodemailer = require('nodemailer');

async function test() {
  console.log("Testing SMTP Connection...");
  console.log("User:", 'b4e33a001@smtp-brevo.com');
  console.log("Pass:", process.env.SMTP_PASSWORD ? "SET" : "UNSET");

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
    await transporter.verify();
    console.log("SMTP Connection successful!");
    
    const info = await transporter.sendMail({
      from: '"Talora Platform" <b4e33a001@smtp-brevo.com>',
      to: 'test@example.com', // Change to something else
      subject: 'Test Email',
      text: 'This is a test email.',
    });
    console.log("Test email sent:", info.messageId);
  } catch (err) {
    console.error("SMTP Error:", err);
  }
}

test();
