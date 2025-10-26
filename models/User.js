import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: String,
        required: true
    },
    bookingId: {
        type: String,
        unique: true
    },
    serviceBooked: {
        type: String,
        required: true
    },
    expectedResponse: {
        type: String,
        required: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    otp: {
        code: String,
        expiresAt: Date
    }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;