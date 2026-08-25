import nodemailer from 'nodemailer';

export const sendEmail = async ({
  to,
  subject,
  html,
}: {
  to: string | string[];
  subject: string;
  html: string;
}) => {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp-relay.brevo.com',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: 'b4e33a001@smtp-brevo.com',
        pass: process.env.SMTP_PASSWORD, // We will get this from the env
      },
    });

    const info = await transporter.sendMail({
      from: '"Talora System" <talora.system@gmail.com>', // Sender address
      to: Array.isArray(to) ? to.join(', ') : to, // list of receivers
      subject: subject, // Subject line
      html: html, // html body
    });

    console.log('Message sent: %s', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
};
