export interface AuthUser {
  id: string;
  email: string;
}

export interface AuthSession {
  user: AuthUser;
  accessToken: string;
}

export interface AuthService {
  getSession(): Promise<AuthSession | null>;
  signIn(email: string, password: string): Promise<AuthSession>;
  signOut(): Promise<void>;
  resetPassword(email: string): Promise<void>;
  updatePassword(newPassword: string): Promise<void>;
  inviteUser(email: string, password: string): Promise<AuthUser>;
  setUserPassword(userId: string, newPassword: string): Promise<void>;
}
