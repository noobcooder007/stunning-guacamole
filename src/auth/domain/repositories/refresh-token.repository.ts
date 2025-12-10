import { RefreshTokenModel } from '@/auth/infrastructure/models/refresh-token.model';
import { Injectable } from '@nestjs/common';

@Injectable()
export abstract class RefreshTokenRepository {
  abstract findOneByUserIdAndHashedRefreshToken(
    userId: string,
    token: string,
  ): Promise<RefreshTokenModel | null>;
  abstract create(refreshToken: Partial<RefreshTokenModel>): RefreshTokenModel;
  abstract save(refreshToken: RefreshTokenModel): Promise<RefreshTokenModel>;
  abstract delete(userId: string, token: string): void;
}
