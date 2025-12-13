export interface AuthResponse {
  user: {
    username: string;
    role: string;
  };
  tokens: {
    accessToken: string;
    expiresIn: Date;
    refreshToken: string;
    refreshExpiresIn: Date;
    sessionId: string;
  };
}
