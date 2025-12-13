import { User } from '../aggregates/user.aggregate';

export interface AuthResponse {
  user: User;
  tokens: {
    accessToken: string;
    expiresIn: Date;
    refreshToken: string;
    refreshExpiresIn: Date;
    sessionId: string;
  };
}
