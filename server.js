import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import otpRoutes from "./routes/otpRoute.js";

dotenv.config();

const app = express();
app.use(cors({
  origin: "https://boosterera-frontend.vercel.app" ,
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

app.use("/api", otpRoutes);

app.get("/", (req, res) => {
  res.send("BoosterEra OTP API Running 🚀");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
