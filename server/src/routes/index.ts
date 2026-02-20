import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import PDFDocument from 'pdfkit';
import User from '../models/User';
import UserSession from '../models/UserSession';
import Customer from '../models/Customer';
import Item from '../models/Item';
import InventoryLog from '../models/InventoryLog';
import Order from '../models/Order';
import BillingPayment from '../models/BillingPayment';
import AccountingAccount from '../models/AccountingAccount';
import GeneralLedgerEntry from '../models/GeneralLedgerEntry';
import Settings from '../models/Settings';
import SystemLog from '../models/SystemLog';
import { JWT_SECRET } from '../config/constants';
import { auth, role } from '../middleware/auth';
import { logAction } from '../utils/logAction';

const router = Router();
const makeToken = (u: any) => jwt.sign({ id: u._id, role: u.role, username: u.username }, JWT_SECRET, { expiresIn: '7d' });

router.post('/auth/login', async (req, res) => {
  const body = z.object({ username: z.string(), password: z.string() }).parse(req.body);
  const user = await User.findOne({ username: body.username });
  if (!user || !user.isActive || !(await bcrypt.compare(body.password, user.passwordHash))) return res.status(400).json({ success: false, error: { message: 'Invalid credentials' } });
  const token = makeToken(user);
  await UserSession.create({ userId: user._id, token, lastActivity: new Date() });
  await logAction('LOGIN', String(user._id), user.username);
  res.json({ success: true, data: { token, user: { _id: user._id, username: user.username, role: user.role, isActive: user.isActive } } });
});
router.post('/auth/logout', auth, async (req, res) => { await UserSession.updateOne({ token: req.headers.authorization?.replace('Bearer ', '') }, { logoutAt: new Date() }); await logAction('LOGOUT', req.user?.id, req.user?.username); res.json({ success: true, data: true }); });
router.get('/auth/me', auth, async (req, res) => { const user = await User.findById(req.user!.id); if (!user) return res.status(401).json({ success: false, error: { message: 'Unauthorized' } }); await UserSession.updateMany({ userId: user._id, logoutAt: null }, { lastActivity: new Date() }); res.json({ success: true, data: { user: { _id: user._id, username: user.username, role: user.role, isActive: user.isActive } } }); });
router.post('/auth/forgot-password', async (req, res) => { const { username } = z.object({ username: z.string() }).parse(req.body); const user = await User.findOne({ username }); if (!user) return res.status(404).json({ success: false, error: { message: 'User not found' } }); const token = Math.random().toString(36).slice(2, 10); user.resetToken = token; user.resetTokenExpiry = new Date(Date.now() + 3600_000); await user.save(); await logAction('PASSWORD_RESET_REQUESTED', String(user._id), user.username); res.json({ success: true, data: { token } }); });
router.post('/auth/reset-password', async (req, res) => { const { token, password } = z.object({ token: z.string(), password: z.string().min(8) }).parse(req.body); const user = await User.findOne({ resetToken: token, resetTokenExpiry: { $gt: new Date() } }); if (!user) return res.status(400).json({ success: false, error: { message: 'Invalid token' } }); user.passwordHash = await bcrypt.hash(password, 10); user.resetToken = undefined; user.resetTokenExpiry = undefined; await user.save(); await logAction('PASSWORD_RESET', String(user._id), user.username); res.json({ success: true, data: true }); });

router.get('/dashboard', auth, async (_req, res) => {
  const [items, orders, pending, rev] = await Promise.all([Item.countDocuments(), Order.countDocuments(), Order.countDocuments({ status: 'Pending Payment' }), BillingPayment.aggregate([{ $group: { _id: null, t: { $sum: '$amount' } } }])]);
  const sales = await BillingPayment.aggregate([{ $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$paymentDate' } }, amount: { $sum: '$amount' } } }, { $sort: { _id: 1 } }, { $project: { _id: 0, date: '$_id', amount: 1 } }]);
  res.json({ success: true, data: { kpis: { totalItems: items, totalOrders: orders, pendingPayments: pending, totalRevenue: rev[0]?.t || 0 }, sales } });
});

router.get('/customers', auth, async (_req, res) => res.json({ success: true, data: await Customer.find().limit(200) }));
router.get('/inventory/items', auth, async (_req, res) => res.json({ success: true, data: await Item.find().sort({ createdAt: -1 }) }));
router.post('/inventory/items', auth, async (req, res) => { const b = z.object({ name: z.string(), price: z.number().nonnegative(), threshold: z.number().int().nonnegative() }).parse(req.body); const item = await Item.create({ ...b, stock: 0 }); await logAction('ITEM_CREATED', req.user?.id, req.user?.username, { itemId: item._id }); res.json({ success: true, data: item }); });
router.post('/inventory/adjust', auth, async (req, res) => { const b = z.object({ itemId: z.string(), delta: z.number().int(), reason: z.string() }).parse(req.body); const item = await Item.findById(b.itemId); if (!item) return res.status(404).json({ success: false, error: { message: 'Not found' } }); item.stock += b.delta; await item.save(); const log = await InventoryLog.create({ itemId: item._id, itemName: item.name, delta: b.delta, reason: b.reason, actorId: req.user?.id }); await logAction('ADJUSTING_ENTRY_CREATED', req.user?.id, req.user?.username, { itemId: item._id, delta: b.delta }); res.json({ success: true, data: log }); });
router.get('/inventory/logs', auth, async (_req, res) => res.json({ success: true, data: await InventoryLog.find().sort({ createdAt: -1 }).limit(500) }));
router.get('/inventory/export/csv', auth, async (_req, res) => { const rows = await Item.find(); res.setHeader('Content-Type', 'text/csv'); res.send(`name,price,stock\n${rows.map(r => `${r.name},${r.price},${r.stock}`).join('\n')}`); });

router.get('/orders', auth, async (_req, res) => res.json({ success: true, data: await Order.find().sort({ createdAt: -1 }) }));
router.post('/orders', auth, async (req, res) => { const b = z.object({ customerId: z.string(), itemId: z.string(), qty: z.number().int().positive(), channel: z.enum(['phone', 'email', 'message']) }).parse(req.body); const [cust, item] = await Promise.all([Customer.findById(b.customerId), Item.findById(b.itemId)]); if (!cust || !item) return res.status(404).json({ success: false, error: { message: 'Invalid refs' } }); if (item.stock < b.qty) return res.status(400).json({ success: false, error: { message: 'Insufficient stock' } }); item.stock -= b.qty; await item.save(); await InventoryLog.create({ itemId: item._id, itemName: item.name, delta: -b.qty, reason: 'ORDER_DISPATCH', actorId: req.user?.id }); const order = await Order.create({ trackingNo: `JOAP-${Date.now()}`, customerId: cust._id, customerName: cust.name, items: [{ itemId: item._id, itemName: item.name, qty: b.qty, price: item.price }], total: item.price * b.qty, channel: b.channel, status: 'Pending Payment', statusHistory: [{ status: 'Pending Payment', at: new Date() }], createdBy: req.user?.id }); await logAction('ORDER_CREATED', req.user?.id, req.user?.username, { orderId: order._id }); res.json({ success: true, data: order }); });
router.get('/orders/:id', auth, async (req, res) => res.json({ success: true, data: await Order.findById(req.params.id) }));
router.post('/orders/:id/status', auth, async (req, res) => { const b = z.object({ status: z.enum(['Pending Payment', 'Ready Dispatch', 'In Transit', 'Completed']) }).parse(req.body); const order = await Order.findById(req.params.id); if (!order) return res.status(404).json({ success: false, error: { message: 'Not found' } }); order.status = b.status; order.statusHistory.push({ status: b.status, at: new Date() }); await order.save(); res.json({ success: true, data: order }); });

router.get('/billing', auth, async (_req, res) => { const [orders, paidToday, revenue] = await Promise.all([Order.find(), BillingPayment.aggregate([{ $match: { paymentDate: { $gte: new Date(new Date().toDateString()) } } }, { $group: { _id: null, t: { $sum: '$amount' } } }]), BillingPayment.aggregate([{ $group: { _id: null, t: { $sum: '$amount' } } }])]); const pending = orders.filter(o => o.status === 'Pending Payment').length; res.json({ success: true, data: { orders, kpis: { pendingPayment: pending, paidToday: paidToday[0]?.t || 0, readyToRelease: orders.filter(o => o.status === 'Ready Dispatch').length, totalRevenue: revenue[0]?.t || 0 } } }); });
router.post('/billing/payments', auth, async (req, res) => { const b = z.object({ orderId: z.string(), amount: z.number().positive(), gcashRef: z.string().regex(/^[A-Za-z0-9-]{6,30}$/) }).parse(req.body); const existing = await BillingPayment.findOne({ gcashRef: b.gcashRef }); if (existing) return res.status(400).json({ success: false, error: { message: 'Duplicate reference' } }); const order = await Order.findById(b.orderId); if (!order) return res.status(404).json({ success: false, error: { message: 'Order not found' } }); const payment = await BillingPayment.create({ ...b, paymentDate: new Date(), createdBy: req.user?.id }); order.status = 'Ready Dispatch'; order.statusHistory.push({ status: 'Ready Dispatch', at: new Date() }); await order.save(); const cash = await AccountingAccount.findOne({ code: '1010' }); const sales = await AccountingAccount.findOne({ code: '4010' }); if (cash && sales) { await GeneralLedgerEntry.create([{ accountId: cash._id, accountName: cash.name, debit: b.amount, credit: 0, memo: `Payment ${order.trackingNo}`, sourceRef: String(payment._id) }, { accountId: sales._id, accountName: sales.name, debit: 0, credit: b.amount, memo: `Payment ${order.trackingNo}`, sourceRef: String(payment._id) }]); }
  await logAction('PAYMENT_LOGGED', req.user?.id, req.user?.username, { paymentId: payment._id });
  res.json({ success: true, data: payment });
});

router.get('/accounting', auth, async (_req, res) => { const [accounts, entries] = await Promise.all([AccountingAccount.find(), GeneralLedgerEntry.find().sort({ createdAt: -1 }).limit(300)]); const summary = await GeneralLedgerEntry.aggregate([{ $group: { _id: null, debit: { $sum: '$debit' }, credit: { $sum: '$credit' } } }]); res.json({ success: true, data: { accounts, entries, summary: summary[0] || { debit: 0, credit: 0 } } }); });
router.post('/accounting/reverse/:id', auth, role('ADMIN'), async (req, res) => { const e = await GeneralLedgerEntry.findById(req.params.id); if (!e) return res.status(404).json({ success: false, error: { message: 'Not found' } }); const r = await GeneralLedgerEntry.create({ accountId: e.accountId, accountName: e.accountName, debit: e.credit, credit: e.debit, memo: `REVERSAL ${e.memo}`, reversedFrom: e._id }); await logAction('REVERSING_ENTRY_CREATED', req.user?.id, req.user?.username, { entryId: e._id }); res.json({ success: true, data: r }); });

router.get('/reports', auth, async (_req, res) => { const sales = await BillingPayment.aggregate([{ $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$paymentDate' } }, amount: { $sum: '$amount' } } }, { $sort: { _id: 1 } }]); const list = sales.map(s => s.amount); const avg = list.length ? list.reduce((a, b) => a + b, 0) / list.length : 0; const trend = list.length > 1 ? list[list.length - 1] - list[0] : 0; const forecast = Array.from({ length: 7 }).map((_, i) => ({ day: i + 1, value: Math.max(0, avg + trend / Math.max(1, list.length) * (i + 1)) })); res.json({ success: true, data: { sales, forecast } }); });
router.get('/reports/csv', auth, async (_req, res) => { const sales = await BillingPayment.find(); res.setHeader('Content-Type', 'text/csv'); res.send(`date,amount,ref\n${sales.map(s => `${s.paymentDate?.toISOString()},${s.amount},${s.gcashRef}`).join('\n')}`); });
router.get('/reports/pdf', auth, async (_req, res) => { const doc = new PDFDocument(); res.setHeader('Content-Type', 'application/pdf'); doc.pipe(res); doc.fontSize(18).text('JOAP Financial Report'); const total = await BillingPayment.aggregate([{ $group: { _id: null, t: { $sum: '$amount' } } }]); doc.moveDown().fontSize(12).text(`Total Revenue: ${total[0]?.t || 0}`); doc.end(); });

router.get('/maintenance/backup', auth, role('ADMIN'), async (_req, res) => { const data = { users: await User.find({}, '-passwordHash -resetToken'), customers: await Customer.find(), items: await Item.find(), orders: await Order.find(), payments: await BillingPayment.find(), ledger: await GeneralLedgerEntry.find() }; await logAction('BACKUP_CREATED'); res.json(data); });
router.post('/maintenance/restore', auth, role('ADMIN'), async (req, res) => { const b = z.object({ customers: z.array(z.any()).optional(), items: z.array(z.any()).optional(), orders: z.array(z.any()).optional(), payments: z.array(z.any()).optional(), ledger: z.array(z.any()).optional() }).parse(req.body); if (b.customers) { await Customer.deleteMany({}); await Customer.insertMany(b.customers); } if (b.items) { await Item.deleteMany({}); await Item.insertMany(b.items); } await logAction('RESTORE_COMPLETED', req.user?.id, req.user?.username); res.json({ success: true, data: true }); });

router.get('/settings', auth, async (_req, res) => { let s = await Settings.findOne(); if (!s) s = await Settings.create({ companyName: 'JOAP HARDWARE', theme: 'light', defaultReorderThreshold: 10 }); res.json({ success: true, data: s }); });
router.put('/settings', auth, role('ADMIN'), async (req, res) => { const b = z.object({ companyName: z.string(), theme: z.string(), defaultReorderThreshold: z.number() }).parse(req.body); const s = await Settings.findOneAndUpdate({}, b, { upsert: true, new: true }); await logAction('SETTINGS_CHANGED', req.user?.id, req.user?.username); res.json({ success: true, data: s }); });

router.get('/admin/users', auth, role('ADMIN'), async (_req, res) => { const users = await User.find({}, '-passwordHash -resetToken -resetTokenExpiry'); res.json({ success: true, data: users }); });
router.post('/admin/users', auth, role('ADMIN'), async (req, res) => { const b = z.object({ username: z.string(), role: z.enum(['ADMIN', 'EMPLOYEE']) }).parse(req.body); const tempPassword = `Temp${Math.random().toString(36).slice(2,8)}!`; const user = await User.create({ username: b.username, role: b.role, isActive: true, passwordHash: await bcrypt.hash(tempPassword, 10) }); await logAction('USER_CREATED', req.user?.id, req.user?.username, { target: user._id }); res.json({ success: true, data: { user: { _id: user._id, username: user.username, role: user.role, isActive: user.isActive }, tempPassword } }); });
router.patch('/admin/users/:id/status', auth, role('ADMIN'), async (req, res) => { const b = z.object({ isActive: z.boolean() }).parse(req.body); const user = await User.findByIdAndUpdate(req.params.id, { isActive: b.isActive }, { new: true }).select('-passwordHash'); await logAction('USER_STATUS_CHANGED', req.user?.id, req.user?.username, { target: req.params.id }); res.json({ success: true, data: user }); });
router.patch('/admin/users/:id/role', auth, role('ADMIN'), async (req, res) => { const b = z.object({ role: z.enum(['ADMIN', 'EMPLOYEE']) }).parse(req.body); const user = await User.findByIdAndUpdate(req.params.id, { role: b.role }, { new: true }).select('-passwordHash'); await logAction('USER_ROLE_CHANGED', req.user?.id, req.user?.username, { target: req.params.id }); res.json({ success: true, data: user }); });
router.post('/admin/users/:id/reset-password', auth, role('ADMIN'), async (req, res) => { const tempPassword = `Temp${Math.random().toString(36).slice(2,8)}!`; await User.findByIdAndUpdate(req.params.id, { passwordHash: await bcrypt.hash(tempPassword, 10) }); await logAction('USER_PASSWORD_RESET', req.user?.id, req.user?.username, { target: req.params.id }); res.json({ success: true, data: { tempPassword } }); });

router.get('/logs', auth, role('ADMIN'), async (_req, res) => res.json({ success: true, data: await SystemLog.find().sort({ createdAt: -1 }).limit(500) }));
router.post('/about/feedback', auth, async (req, res) => { const b = z.object({ message: z.string().min(1) }).parse(req.body); const row = await SystemLog.create({ action: 'FEEDBACK', actorId: req.user?.id, actorName: req.user?.username, meta: { message: b.message } }); res.json({ success: true, data: row }); });

router.get('/search', auth, async (req, res) => {
  const q = String(req.query.q || '').toLowerCase();
  const items = await Item.find({ name: { $regex: `^${q}`, $options: 'i' } }).limit(5);
  const customers = await Customer.find({ name: { $regex: `^${q}`, $options: 'i' } }).limit(5);
  const orders = await Order.find({ trackingNo: { $regex: `^${q}`, $options: 'i' } }).limit(5);
  res.json({ success: true, data: { results: [...items.map(i => ({ type: 'Item', name: i.name })), ...customers.map(c => ({ type: 'Customer', name: c.name })), ...orders.map(o => ({ type: 'Order', name: o.trackingNo }))] } });
});

export default router;
