import { Schema, model } from 'mongoose';

const userSchema = new Schema({
  username: { type: String, unique: true, required: true, index: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['ADMIN', 'EMPLOYEE'], required: true },
  isActive: { type: Boolean, default: true },
  resetToken: String,
  resetTokenExpiry: Date
}, { timestamps: true });

export default model('User', userSchema);
