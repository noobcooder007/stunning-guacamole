import { JwtService } from '@nestjs/jwt';

export class AccessJwtPayload {
  id: string;
  role: string;
  rights?: string[];
  gender?: string;
  collectorId?: string;
  beneficientId?: string;
}

export interface RefreshJwtPayload {
  id: string;
  sessionId: string;
}

export class JWTService extends JwtService {
  REFRESHTOKENVALIDITYMS = 30 * 24 * 60 * 60 * 1000;
  ACCESSTOKENVALIDITYMS = 5 * 60 * 1000;

  constructor() {
    super({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '5m' },
    });
  }

  createAccessToken(payload: AccessJwtPayload) {
    return this.sign(payload);
  }

  createRefreshToken(payload: RefreshJwtPayload) {
    return this.sign(payload, { expiresIn: '30d' });
  }
}
