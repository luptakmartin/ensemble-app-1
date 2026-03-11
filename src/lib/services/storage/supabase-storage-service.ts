import type { SupabaseClient } from "@supabase/supabase-js";
import type { StorageService, UploadResult } from "./storage-service";

export class SupabaseStorageService implements StorageService {
  constructor(private supabase: SupabaseClient) {}

  async upload(bucket: string, path: string, file: File | Blob): Promise<UploadResult> {
    const { error } = await this.supabase.storage
      .from(bucket)
      .upload(path, file);

    if (error) {
      throw new Error(`Storage upload failed: ${error.message}`);
    }

    const url = this.getPublicUrl(bucket, path);
    return { path, url };
  }

  getPublicUrl(bucket: string, path: string): string {
    const { data } = this.supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    return data.publicUrl;
  }

  async delete(bucket: string, paths: string[]): Promise<void> {
    const { error } = await this.supabase.storage
      .from(bucket)
      .remove(paths);

    if (error) {
      throw new Error(`Storage delete failed: ${error.message}`);
    }
  }
}
