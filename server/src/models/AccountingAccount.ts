import { Schema, model } from 'mongoose';
const schema = new Schema({ code: String, name: String, type: String }, { timestamps: true });
export default model('AccountingAccount', schema);
