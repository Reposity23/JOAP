import { Schema, model } from 'mongoose';
const schema = new Schema({ userId: { type: Schema.Types.ObjectId, ref: 'User', index: true }, token: String, lastActivity: Date, logoutAt: Date }, { timestamps: true });
export default model('UserSession', schema);
