export interface UploadResult {
  path: string;
  url: string;
}

export interface StorageService {
  upload(bucket: string, path: string, file: File | Blob): Promise<UploadResult>;
  getPublicUrl(bucket: string, path: string): string;
  delete(bucket: string, paths: string[]): Promise<void>;
}
