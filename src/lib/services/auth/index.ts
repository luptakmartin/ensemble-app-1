import type { AuthService } from "./auth-service";
import { SupabaseAuthService } from "./supabase-auth-service";

export function getAuthService(): AuthService {
  return new SupabaseAuthService();
}

export type { AuthService, AuthSession, AuthUser } from "./auth-service";
