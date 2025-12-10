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

  public async findOneByUserIdAndHashedRefreshToken(
    userId: string,
    hashedToken: string,
  ): Promise<RefreshToken> {
    const refreshToken =
      await this.refreshTokenRepository.findOneByUserIdAndHashedRefreshToken(
        userId,
        hashedToken,
      );
    if (!refreshToken)
      throw new UnauthorizedException(
        'Token inválido (tal vez fue usado o expirado)',
      );
    return new RefreshToken()
      .setUserId(refreshToken.userId)
      .setHashRefreshToken(refreshToken.hashedRefreshToken)
      .setExpiresAt(refreshToken.expiresAt)
      .setCreatedAt(refreshToken.createdAt)
      .build();
  }

  public create(refreshToken: Partial<RefreshToken>): RefreshTokenModel {
    return this.refreshTokenRepository.create({
      userId: refreshToken.userId,
      hashedRefreshToken: refreshToken.hashedRefreshToken,
      expiresAt: refreshToken.expiresAt,
    });
  }

  public save(refreshToken: RefreshTokenModel): Promise<RefreshTokenModel> {
    return this.refreshTokenRepository.save(refreshToken);
  }

  public delete(userId: string, hashedToken: string): void {
    this.refreshTokenRepository.delete(userId, hashedToken);
  }
}
