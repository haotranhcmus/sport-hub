// Shared utilities and helpers for services
import { supabase } from "../lib/supabase";

export const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Helper to ensure updatedAt is included in UPDATE operations
 * Supabase REST API doesn't auto-handle Prisma @updatedAt decorator
 */
export const withUpdatedAt = (data: any) => ({
  ...data,
  updatedAt: new Date().toISOString(),
});

// Helper function to add timestamps to SystemLog
export const createSystemLog = (logData: any) => {
  return {
    id: crypto.randomUUID(),
    actorId: logData.actorId,
    actorName: logData.actorName,
    actionType: logData.action || logData.actionType,
    targetId: logData.recordId || logData.targetId,
    oldValue: logData.oldValue || null,
    newValue: logData.newValue || null,
    ipAddress: logData.ipAddress || "unknown",
    description: logData.description,
    timestamp: new Date().toISOString(),
  };
};

// Insert system log to database
export const insertSystemLog = async (logData: any) => {
  await supabase.from("SystemLog").insert(createSystemLog(logData));
};
