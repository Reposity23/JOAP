import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { MONGODB_URI } from '../config/key_db';
import User from '../models/User';
import Customer from '../models/Customer';
import Item from '../models/Item';
import Order from '../models/Order';
import AccountingAccount from '../models/AccountingAccount';

async function run(){
  await mongoose.connect(MONGODB_URI);
  if(!await User.findOne({username:'admin'})) await User.create({username:'admin',passwordHash:await bcrypt.hash('Admin123!',10),role:'ADMIN',isActive:true});
  if((await Customer.countDocuments())===0) await Customer.insertMany([{name:'Walk-in Customer',contact:'N/A'},{name:'Ace Builders',contact:'0917-1000'}]);
  if((await Item.countDocuments())===0) await Item.insertMany([{name:'Cement 40kg',price:280,threshold:20,stock:100},{name:'PVC Pipe',price:120,threshold:10,stock:50}]);
  if((await AccountingAccount.countDocuments())===0) await AccountingAccount.insertMany([{code:'1010',name:'Cash/GCash',type:'Asset'},{code:'4010',name:'Sales Revenue',type:'Revenue'},{code:'5010',name:'Operating Expense',type:'Expense'}]);
  if((await Order.countDocuments())===0){ const c=await Customer.findOne(); const i=await Item.findOne(); if(c&&i) await Order.create({trackingNo:`JOAP-${Date.now()}`,customerId:c._id,customerName:c.name,items:[{itemId:i._id,itemName:i.name,qty:2,price:i.price}],total:i.price*2,channel:'phone',status:'Pending Payment',statusHistory:[{status:'Pending Payment',at:new Date()}]}); }
  console.log('Seed complete');
  console.log('Admin credentials: username=admin password=Admin123!');
  await mongoose.disconnect();
}
run();
