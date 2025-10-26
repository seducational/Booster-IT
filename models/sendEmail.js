import nodemailer from "nodemailer";

export const sendEmail = async (to, subject, text) => {
  try {
    // Create a transporter using SMTP
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, // use SSL
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      timeout: 10000, // 10 seconds timeout
      tls: {
        rejectUnauthorized: true,
        minVersion: "TLSv1.2"
      }
    });

    // Verify SMTP connection
    try {
      await transporter.verify();
    } catch (verifyError) {
      console.error("SMTP Verification failed:", verifyError);
      throw new Error("Failed to connect to email server");
    }

    // Send the email with both text and HTML versions
    const mailOptions = {
      from: `"BoosterEra IT Services" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text, // Plain text version
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2c5282; text-align: center;">BoosterEra IT Services</h2>
          <div style="background-color: #f7fafc; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <p style="font-size: 16px; color: #2d3748;">${text}</p>
          </div>
          <p style="color: #718096; font-size: 14px; text-align: center;">
            This is an automated message, please do not reply.
          </p>
        </div>
      `
    };

    const info = await new Promise((resolve, reject) => {
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Send Mail Error:", error);
          reject(error);
        } else {
          resolve(info);
        }
      });
    });

    console.log(`📧 Email sent successfully to ${to} (ID: ${info.messageId})`);
    return true;
  } catch (err) {
    console.error("❌ Email sending failed:", err);
    // Provide more specific error messages
    if (err.code === 'ETIMEDOUT') {
      throw new Error("Email server connection timed out. Please try again.");
    } else if (err.code === 'EAUTH') {
      throw new Error("Email authentication failed. Please check credentials.");
    } else {
      throw new Error(err.message || "Failed to send email");
    }
  }
};
