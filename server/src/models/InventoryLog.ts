import { Schema, model } from 'mongoose';
const schema = new Schema({ itemId: { type: Schema.Types.ObjectId, ref: 'Item', index: true }, itemName: String, delta: Number, reason: String, actorId: { type: Schema.Types.ObjectId, ref: 'User' } }, { timestamps: true });
export default model('InventoryLog', schema);
