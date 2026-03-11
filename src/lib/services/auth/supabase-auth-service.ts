import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { AuthService, AuthSession, AuthUser } from "./auth-service";

export class SupabaseAuthService implements AuthService {
  async getSession(): Promise<AuthSession | null> {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user || !user.email) {
      return null;
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();

    return {
      user: {
        id: user.id,
        email: user.email,
      },
      accessToken: session?.access_token ?? "",
    };
  }

  async signIn(email: string, password: string): Promise<AuthSession> {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user || !data.user.email) {
      throw new Error(error?.message ?? "Sign in failed");
    }

    return {
      user: {
        id: data.user.id,
        email: data.user.email,
      },
      accessToken: data.session?.access_token ?? "",
    };
  }

  async signOut(): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(error.message);
    }
  }

  async resetPassword(email: string): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) {
      throw new Error(error.message);
    }
  }

  async updatePassword(newPassword: string): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) {
      throw new Error(error.message);
    }
  }

  async inviteUser(email: string, password: string): Promise<AuthUser> {
    const adminClient = createAdminClient();
    const { data, error } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (error || !data.user || !data.user.email) {
      throw new Error(error?.message ?? "Failed to create user");
    }

    return {
      id: data.user.id,
      email: data.user.email,
    };
  }
}
