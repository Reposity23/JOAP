import { Response } from 'express';
export const ok = (res: Response, data: unknown) => res.json({ success: true, data });
export const fail = (res: Response, message: string, status = 400) => res.status(status).json({ success: false, error: { message } });
