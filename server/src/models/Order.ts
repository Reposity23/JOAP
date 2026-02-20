import { Schema, model } from 'mongoose';
const schema = new Schema({ trackingNo: { type: String, index: true }, customerId: { type: Schema.Types.ObjectId, ref: 'Customer' }, customerName: String, items: [{ itemId: Schema.Types.ObjectId, itemName: String, qty: Number, price: Number }], total: Number, channel: String, status: { type: String, default: 'Pending Payment' }, statusHistory: [{ status: String, at: Date }], createdBy: { type: Schema.Types.ObjectId, ref: 'User' } }, { timestamps: true });
export default model('Order', schema);
