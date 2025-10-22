import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import otpRoutes from "./routes/otpRoute.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api", otpRoutes);

app.get("/", (req, res) => {
  res.send("BoosterEra OTP API Running 🚀");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
