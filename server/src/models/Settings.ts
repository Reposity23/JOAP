import { Schema, model } from 'mongoose';
const schema = new Schema({ companyName: String, theme: String, defaultReorderThreshold: Number }, { timestamps: true });
export default model('Settings', schema);
