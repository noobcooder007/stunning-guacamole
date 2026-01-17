import { JwtService } from '@nestjs/jwt';

export class AccessJwtPayload {
  id: string;
  rights?: string[];
}

export interface RefreshJwtPayload {
  id: string;
  sessionId: string;
}

export class JWTService extends JwtService {
  REFRESHTOKENVALIDITYMS = 30 * 24 * 60 * 60 * 1000;
  ACCESSTOKENVALIDITYMS = 15 * 60 * 1000;

  constructor() {
    super({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '15m' },
    });
  }

  createAccessToken(payload: AccessJwtPayload) {
    return this.sign(payload);
  }

  createRefreshToken(payload: RefreshJwtPayload) {
    return this.sign(payload, { expiresIn: '30d' });
  }
}
