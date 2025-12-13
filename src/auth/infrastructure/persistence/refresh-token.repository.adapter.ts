import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefreshTokenRepository } from '@/auth/domain/repositories/refresh-token.repository';
import { RefreshTokenModel } from '@/auth/infrastructure/models/refresh-token.model';
import { RefreshToken } from '@/auth/domain/value-objects/refresh-token.vo';

@Injectable()
export class RefreshTokenRepositoryAdapter implements RefreshTokenRepository {
  constructor(
    @InjectRepository(RefreshTokenModel)
    private readonly refreshTokenRepository: Repository<RefreshTokenModel>,
  ) {}

  findOneByUserIdAndHashedRefreshTokenAndSessionId(
    userId: string,
    token: string,
    sessionId: string,
  ): Promise<RefreshTokenModel | null> {
    return this.refreshTokenRepository.findOne({
      where: {
        userId: userId,
        hashedRefreshToken: token,
        sessionId: sessionId,
      },
    });
  }

  create(refreshToken: RefreshToken): RefreshTokenModel {
    const refreshTokenModel = new RefreshTokenModel();
    refreshTokenModel.userId = refreshToken.userId;
    refreshTokenModel.hashedRefreshToken = refreshToken.hashedRefreshToken;
    refreshTokenModel.sessionId = refreshToken.sessionId;
    refreshTokenModel.ip = refreshToken.ip;
    refreshTokenModel.userAgent = refreshToken.userAgent;
    refreshTokenModel.expiresAt = refreshToken.expiresAt;
    refreshTokenModel.createdAt = refreshToken.createdAt;
    return this.refreshTokenRepository.create(refreshTokenModel);
  }

  save(refreshToken: RefreshTokenModel): Promise<RefreshTokenModel> {
    return this.refreshTokenRepository.save(refreshToken);
  }

  upsert(refreshToken: RefreshTokenModel): Promise<RefreshTokenModel> {
    return this.refreshTokenRepository.save(refreshToken);
  }

  delete(userId: string, token: string, sessionId: string): void {
    this.refreshTokenRepository.delete({
      userId: userId,
      hashedRefreshToken: token,
      sessionId: sessionId,
    });
  }
}
