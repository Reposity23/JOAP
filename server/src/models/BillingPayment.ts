import { Schema, model } from 'mongoose';
const schema = new Schema({ orderId: { type: Schema.Types.ObjectId, ref: 'Order', index: true }, amount: Number, gcashRef: { type: String, unique: true, sparse: true }, paymentDate: Date, createdBy: { type: Schema.Types.ObjectId, ref: 'User' } }, { timestamps: true });
export default model('BillingPayment', schema);
