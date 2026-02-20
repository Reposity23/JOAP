import { Schema, model } from 'mongoose';
const schema = new Schema({ accountId: { type: Schema.Types.ObjectId, ref: 'AccountingAccount' }, accountName: String, debit: Number, credit: Number, memo: String, sourceRef: String, reversedFrom: { type: Schema.Types.ObjectId, ref: 'GeneralLedgerEntry' } }, { timestamps: true });
export default model('GeneralLedgerEntry', schema);
