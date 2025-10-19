import { sendEmail } from "../models/sendEmail.js";

const otpStore = new Map(); // temp memory store { contact: { otp, expiresAt } }

export const sendOtp = async (req, res) => {
  try {
    const { contact, method } = req.body;
    if (!contact || !method) {
      return res.status(400).json({ success: false, message: "Invalid request" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 2 * 60 * 1000; // valid for 2 min
    otpStore.set(contact, { otp, expiresAt });

    if (method === "email") {
      await sendEmail(contact, "Your BoosterEra OTP", `Your OTP is ${otp}. It expires in 2 minutes.`);
    } else {
      console.log(`📱 Simulated SMS sent to ${contact}: OTP = ${otp}`);
      // You could integrate a free SMS gateway API here
    }

    res.json({ success: true, message: "OTP sent successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { contact, otp } = req.body;
    if (!contact || !otp) {
      return res.status(400).json({ success: false, message: "Invalid request" });
    }

    const stored = otpStore.get(contact);
    if (!stored) {
      return res.status(400).json({ success: false, message: "OTP not found or expired" });
    }

    if (Date.now() > stored.expiresAt) {
      otpStore.delete(contact);
      return res.status(400).json({ success: false, message: "OTP expired" });
    }

    if (stored.otp !== otp) {
      return res.status(400).json({ success: false, message: "Incorrect OTP" });
    }

    otpStore.delete(contact);
    res.json({ success: true, message: "OTP verified successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
