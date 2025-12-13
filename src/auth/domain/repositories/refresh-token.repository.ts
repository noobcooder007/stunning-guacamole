import { RefreshTokenModel } from '@/auth/infrastructure/models/refresh-token.model';
import { Injectable } from '@nestjs/common';
import { RefreshToken } from '../value-objects/refresh-token.vo';

@Injectable()
export abstract class RefreshTokenRepository {
  abstract findOneByUserIdAndHashedRefreshTokenAndSessionId(
    userId: string,
    token: string,
    sessionId: string,
  ): Promise<RefreshTokenModel | null>;
  abstract create(refreshToken: RefreshToken): RefreshTokenModel;
  abstract save(refreshToken: RefreshTokenModel): Promise<RefreshTokenModel>;
  abstract upsert(refreshToken: RefreshTokenModel): Promise<RefreshTokenModel>;
  abstract delete(userId: string, token: string, sessionId: string): void;
}
