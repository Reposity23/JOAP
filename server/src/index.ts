import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import morgan from 'morgan';
import routes from './routes';
import { errorHandler } from './middleware/error';
import { MONGODB_URI } from './config/key_db';

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(morgan('dev'));

if (!MONGODB_URI.includes('mongodb://')) {
  throw new Error('Database not configured. Replace server/src/config/key_db.ts with your Railway MongoDB URI.');
}

mongoose.connect(MONGODB_URI).then(() => {
  app.use('/api', routes);
  app.use(errorHandler);
  app.listen(4000, () => console.log('server on 4000'));
}).catch((e) => {
  console.error('Database not configured. Replace server/src/config/key_db.ts with your Railway MongoDB URI.');
  console.error(e.message);
  process.exit(1);
});
