import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  connectionTimeout: 5000, // 5 seconds timeout
  greetingTimeout: 5000,
  socketTimeout: 5000,
});

export const sendVerificationEmail = async (email: string, token: string) => {
  const verificationUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/verify?token=${token}`;

  // ALWAYS log the URL to the console in development for easier debugging
  console.log('================================================');
  console.log(`[EMAIL DEBUG] Verification Link for ${email}:`);
  console.log(verificationUrl);
  console.log('================================================');

  const mailOptions = {
    from: `"Talora University System" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Verify Your Talora Account',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #4f46e5;">Welcome to Talora!</h2>
        <p>Thank you for registering. Please click the button below to verify your email address and activate your account.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Verify Email</a>
        </div>
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #64748b;">${verificationUrl}</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="font-size: 12px; color: #94a3b8;">If you did not create an account, please ignore this email.</p>
      </div>
    `,
  };

  try {
    if (!process.env.EMAIL_USER || process.env.EMAIL_USER.includes('your-email')) {
      console.log('NOTE: Real email not sent because EMAIL_USER is not configured correctly in .env');
      return;
    }
    await transporter.sendMail(mailOptions);
    console.log(`[EMAIL] Verification email sent to ${email} via Brevo.`);
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw new Error('Failed to send verification email');
  }
};
