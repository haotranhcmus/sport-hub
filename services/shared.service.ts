// Shared utilities and helpers for services
import { supabase } from "../lib/supabase";

export const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// Helper function to add timestamps to SystemLog
export const createSystemLog = (logData: any) => {
  const now = new Date().toISOString();
  return {
    ...logData,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  };
};

// Insert system log to database
export const insertSystemLog = async (logData: any) => {
  await supabase.from("SystemLog").insert(createSystemLog(logData));
};
