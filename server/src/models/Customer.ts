import { Schema, model } from 'mongoose';
const schema = new Schema({ name: { type: String, index: true }, contact: String }, { timestamps: true });
export default model('Customer', schema);
