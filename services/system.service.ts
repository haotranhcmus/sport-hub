// System Configuration and Logs Service
import { supabase } from "../lib/supabase";
import { User, SystemConfig } from "../types";
import { createSystemLog } from "./shared.service";

export const systemService = {
  getConfig: async (): Promise<SystemConfig> => {
    const { data, error } = await supabase
      .from("SystemConfig")
      .select("*")
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  getLogs: async () => {
    const { data, error } = await supabase
      .from("SystemLog")
      .select("*")
      .order("timestamp", { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  },

  updateConfig: async (updates: any, user?: User) => {
    const { data, error } = await supabase
      .from("SystemConfig")
      .update(updates)
      .eq("id", 1) // Assuming single config row
      .select()
      .single();

    if (error) throw new Error(error.message);

    if (user) {
      await supabase.from("SystemLog").insert(
        createSystemLog({
          action: "UPDATE",
          tableName: "SystemConfig",
          description: "Cập nhật cấu hình hệ thống",
          actorId: user.id,
          actorName: user.fullName,
        })
      );
    }

    return data;
  },
};
