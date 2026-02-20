import { Schema, model } from 'mongoose';
const schema = new Schema({ action: String, actorId: String, actorName: String, meta: Schema.Types.Mixed }, { timestamps: true });
export default model('SystemLog', schema);
