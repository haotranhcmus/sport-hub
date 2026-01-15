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
    // First get the config to find its ID
    const { data: existingConfig } = await supabase
      .from("SystemConfig")
      .select("id")
      .limit(1)
      .single();

    if (!existingConfig) {
      throw new Error("Không tìm thấy cấu hình hệ thống");
    }

    // Remove id from updates to avoid conflicts
    const { id, ...updateData } = updates;

    const { data, error } = await supabase
      .from("SystemConfig")
      .update(updateData)
      .eq("id", existingConfig.id)
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
