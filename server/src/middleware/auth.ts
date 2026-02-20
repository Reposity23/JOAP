import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/constants';

declare global { namespace Express { interface Request { user?: { id: string; role: 'ADMIN' | 'EMPLOYEE'; username: string } } } }

export const auth = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
  try { req.user = jwt.verify(token, JWT_SECRET) as any; next(); } catch { return res.status(401).json({ success: false, error: { message: 'Invalid token' } }); }
};

export const role = (...roles: ('ADMIN' | 'EMPLOYEE')[]) => (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || !roles.includes(req.user.role)) return res.status(403).json({ success: false, error: { message: 'Forbidden' } });
  next();
};
