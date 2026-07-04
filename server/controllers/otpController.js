// controllers/OtpController.js
const otpRepository = require('../repositories/OtpRepository');
const nodemailer = require('nodemailer');
require('dotenv').config();

// Define a helper function to compile a fresh configuration profile on invocation
const createGmailTransporter = () => {
  if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
    throw new Error('Missing MAIL_USER or MAIL_PASS property flags inside your system environment configurations.');
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });
};

class OtpController {
  sendOtp = async (req, res, next) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ status: 'error', message: 'An institutional email address parameter is required.' });
      }

      // Initialize the transporter dynamically right inside the call scope
      const transporter = createGmailTransporter();
      const otp = await otpRepository.createForEmail(email);

      const mailOptions = {
        from: `"NAAP Security Gateway" <${process.env.MAIL_USER}>`,
        to: email,
        subject: 'Identity Clearance Token - NAAP Security Gateway',
        html: `
          <div style="font-family: sans-serif; max-width: 500px; padding: 24px; background-color: #0f172a; color: #ffffff; border-radius: 16px; border: 1px solid #1e293b;">
            <h2 style="color: #10b981; font-size: 18px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">
              National Aviation Academy of the Philippines
            </h2>
            <div style="background-color: #020617; border: 1px solid #334155; padding: 16px; border-radius: 12px; text-align: center; margin-bottom: 24px; margin-top: 24px;">
              <span style="font-family: monospace; font-size: 32px; font-weight: 900; letter-spacing: 6px; color: #ffffff;">
                ${otp.code}
              </span>
            </div>
            <p style="font-size: 12px; color: #94a3b8; line-height: 1.6;">
              Input this 6-digit security token into your registration terminal layout to verify ownership of this email address. This code will expire automatically in 15 minutes.
            </p>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);

      return res.status(200).json({
        status: 'success',
        message: 'A security validation token has been successfully dispatched to your email.'
      });

    } catch (error) {
      console.error('❌ OTP Gmail Dispatch Exception Handled:', error);
      next(error);
    }
  };

  verifyOtp = async (req, res, next) => {
    // Keep your existing verification handling block completely identical...
    try {
      const { email, otp } = req.body;
      if (!email || !otp) {
        return res.status(400).json({ status: 'error', message: 'Both email and verification token are required.' });
      }
      const isValid = await otpRepository.verifyCode(email, otp);
      if (!isValid) {
        return res.status(422).json({ status: 'error', message: 'The security code entered is invalid or has expired.' });
      }
      return res.status(200).json({ status: 'success', message: 'Security validation checkpoint cleared.' });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new OtpController();