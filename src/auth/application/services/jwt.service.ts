import { AccessJwtPayload } from '@/auth/domain/value-objects/jwt-payload.vo';
import { RefreshJwtPayload } from '@/auth/domain/value-objects/refresh-jwt-payload.vo';
import { JwtService } from '@nestjs/jwt';

export class JWTService extends JwtService {
  sessionVALIDITYMS = 30 * 24 * 60 * 60 * 1000;
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
