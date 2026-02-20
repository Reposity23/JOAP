import { Schema, model } from 'mongoose';
const schema = new Schema({ name: { type: String, index: true }, price: Number, threshold: Number, baseQty: { type: Number, default: 0 }, stock: { type: Number, default: 0 } }, { timestamps: true });
export default model('Item', schema);
