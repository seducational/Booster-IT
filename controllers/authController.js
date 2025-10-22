import jwt from "jsonwebtoken";
import User from "../models/user";

const JWT_SECRET = process.env.JWT_SECRET || "change_this_secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

export const registerUser = async (req, res) => {
  try {
    const {
      contact,
      method,
      firstName = "",
      lastName = "",
      company = "",
      role = "",
      services = [],
    } = req.body;

    if (!contact || !method) {
      return res.status(400).json({ success: false, message: "Missing contact or method" });
    }

    // Upsert the user (create if not exists, update if exists)
    const update = {
      method,
      firstName,
      lastName,
      company,
      role,
      services,
      updatedAt: Date.now(),
    };

    const options = { new: true, upsert: true, setDefaultsOnInsert: true };
    const user = await User.findOneAndUpdate({ contact }, update, options).lean();

    // create a JWT
    const token = jwt.sign({ id: user._id, contact: user.contact }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    res.json({
      success: true,
      message: "User registered",
      data: { user, token },
    });
  } catch (err) {
    console.error("registerUser error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
