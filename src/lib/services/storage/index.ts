import { createClient } from "@/lib/supabase/server";
import { SupabaseStorageService } from "./supabase-storage-service";
import type { StorageService } from "./storage-service";

export async function getStorageService(): Promise<StorageService> {
  const supabase = await createClient();
  return new SupabaseStorageService(supabase);
}

export type { StorageService, UploadResult } from "./storage-service";
