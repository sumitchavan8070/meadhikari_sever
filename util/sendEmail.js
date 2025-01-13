const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  try {
    // 1. Create a transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST, // e.g., "smtp.gmail.com"
      port: process.env.EMAIL_PORT, // e.g., 465 for SSL
      secure: true, // true for SSL
      auth: {
        user: process.env.EMAIL_USER, // Your email address
        pass: process.env.EMAIL_PASSWORD, // Your email password or app-specific password
      },
    });

    // 2. Define email options
    const mailOptions = {
      from: `${process.env.EMAIL_USER}`, // Sender address
      to: options.to, // Recipient address
      subject: options.subject, // Subject line
      text: options.text, // Plain text body
      html: options.html, // HTML body
    };

    // 3. Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.messageId);
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email.");
  }
};

module.exports = sendEmail;
