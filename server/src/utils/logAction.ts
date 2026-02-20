import SystemLog from '../models/SystemLog';
export const logAction = async (action: string, actorId?: string, actorName?: string, meta?: Record<string, unknown>) => {
  await SystemLog.create({ action, actorId, actorName, meta });
};
