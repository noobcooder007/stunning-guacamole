import { RefreshToken } from '@/auth/infrastructure/models/refresh-token.model';
import { Injectable } from '@nestjs/common';

@Injectable()
export abstract class RefreshTokenRepository {
  abstract findOneByUserIdAndHashedRefreshToken(
    userId: string,
    token: string,
  ): Promise<RefreshToken | null>;
  abstract create(refreshToken: Partial<RefreshToken>): RefreshToken;
  abstract save(refreshToken: RefreshToken): Promise<RefreshToken>;
  abstract delete(userId: string, token: string): void;
}
