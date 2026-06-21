const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  const isMockSmtp =
    !process.env.SMTP_USER ||
    process.env.SMTP_USER === 'mockuser' ||
    !process.env.SMTP_HOST ||
    process.env.SMTP_HOST.includes('mailtrap');

  if (isMockSmtp) {
    console.log('\n--- EMAIL NOTIFICATION LOG ---');
    console.log(`To: ${options.email}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Message:\n${options.message}`);
    console.log('-------------------------------\n');
    return { success: true, message: 'Email logged to console (Mock SMTP)' };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const message = {
      from: `${process.env.FROM_EMAIL || 'noreply@hotelbook.com'}`,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html || `<p>${options.message}</p>`,
    };

    const info = await transporter.sendMail(message);
    console.log(`Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('Nodemailer Error: ', error.message);
    // Don't throw the error; log it and proceed so booking doesn't fail
    return { success: false, error: error.message };
  }
};

module.exports = { sendEmail };
