import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { RefreshTokenRepository } from '@/auth/domain/repositories/refresh-token.repository';
import { RefreshToken } from '../value-objects/refresh-token.vo';
import { RefreshTokenModel } from '@/auth/infrastructure/models/refresh-token.model';

@Injectable()
export class RefreshTokenService {
  constructor(
    @Inject(RefreshTokenRepository)
    private readonly refreshTokenRepository: RefreshTokenRepository,
  ) {}

  public async findOneByUserIdAndHashedRefreshTokenAndSessionId(
    userId: string,
    hashedToken: string,
    sessionId: string,
  ): Promise<RefreshToken> {
    const refreshToken =
      await this.refreshTokenRepository.findOneByUserIdAndHashedRefreshTokenAndSessionId(
        userId,
        hashedToken,
        sessionId,
      );
    if (!refreshToken)
      throw new UnauthorizedException(
        'Token inválido (tal vez fue usado o expirado)',
      );
    return new RefreshToken()
      .setSessionId(refreshToken.sessionId)
      .setUserId(refreshToken.userId)
      .setHashRefreshToken(refreshToken.hashedRefreshToken)
      .setExpiresAt(refreshToken.expiresAt)
      .setCreatedAt(refreshToken.createdAt)
      .build();
  }

  public create(refreshToken: RefreshToken): RefreshTokenModel {
    return this.refreshTokenRepository.create(refreshToken);
  }

  public save(refreshToken: RefreshTokenModel): Promise<RefreshTokenModel> {
    return this.refreshTokenRepository.save(refreshToken);
  }

  public upsert(refreshToken: RefreshTokenModel): Promise<RefreshTokenModel> {
    return this.refreshTokenRepository.upsert(refreshToken);
  }

  public delete(userId: string, hashedToken: string, sessionId: string): void {
    this.refreshTokenRepository.delete(userId, hashedToken, sessionId);
  }
}
