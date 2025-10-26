import { sendEmail } from "../models/sendEmail.js";
import User from "../models/User.js";
import { v4 as uuidv4 } from 'uuid';

export const sendOtp = async (req, res) => {
  try {
    const { contact, method, name, serviceBooked, expectedResponse } = req.body;
    if (!contact || !method) {
      return res.status(400).json({ success: false, message: "Contact and method are required" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000); // valid for 2 min

    // Create or update user
    let user = await User.findOne({ email: contact });
    const bookingId = user?.bookingId || uuidv4();
    
    if (!user) {
      user = new User({
        name: name || 'Guest',
        email: contact,
        phone: contact,
        bookingId,
        serviceBooked: serviceBooked || 'Not specified',
        expectedResponse: expectedResponse || 'Standard',
        otp: { code: otp, expiresAt }
      });
    } else {
      // Update user information
      user.otp = { code: otp, expiresAt };
      if (name) user.name = name;
      if (serviceBooked) user.serviceBooked = serviceBooked;
      if (expectedResponse) user.expectedResponse = expectedResponse;
      // Only update bookingId if it doesn't exist
      if (!user.bookingId) user.bookingId = bookingId;
    }
    
    await user.save();

    if (method === "email") {
      await sendEmail(
        contact, 
        "Your BoosterEra OTP", 
        `Your OTP is ${otp}. It expires in 2 minutes.\nBooking ID: ${bookingId}`
      );
    } else {
      console.log(`📱 Simulated SMS sent to ${contact}: OTP = ${otp}`);
      // You could integrate a free SMS gateway API here
    }

    res.json({ 
      success: true, 
      message: "OTP sent successfully",
      bookingId
    });
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

    const user = await User.findOne({ email: contact });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (!user.otp || !user.otp.code || !user.otp.expiresAt) {
      return res.status(400).json({ success: false, message: "No OTP was sent" });
    }

    if (Date.now() > user.otp.expiresAt) {
      return res.status(400).json({ success: false, message: "OTP has expired" });
    }

    if (user.otp.code !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    // Clear the OTP and mark as verified
    user.otp = undefined;
    user.isVerified = true;
    await user.save();

    res.json({ 
      success: true, 
      message: "OTP verified successfully",
      bookingId: user.bookingId,
      user: {
        name: user.name,
        email: user.email,
        serviceBooked: user.serviceBooked,
        expectedResponse: user.expectedResponse
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to verify OTP" });
  }
};
