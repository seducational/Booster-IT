import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  contact: { type: String, required: true, index: true, unique: true }, // email or phone
  method: { type: String, enum: ["phone", "email"], required: true },
  firstName: { type: String },
  lastName: { type: String },
  company: { type: String },
  role: { type: String },
  services: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

userSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const User = mongoose.model("User", userSchema);
export default User;
