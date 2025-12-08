import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefreshTokenRepository } from '@/auth/domain/repositories/refresh-token.repository';
import { RefreshToken } from '@/auth/infrastructure/models/refresh-token.model';

@Injectable()
export class RefreshTokenRepositoryAdapter implements RefreshTokenRepository {
  constructor(
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
  ) {}
  findOneByUserIdAndHashedRefreshToken(
    userId: string,
    token: string,
  ): Promise<RefreshToken | null> {
    return this.refreshTokenRepository.findOne({
      where: {
        userId: userId,
        hashedRefreshToken: token,
      },
    });
  }
  create(refreshToken: Partial<RefreshToken>): RefreshToken {
    return this.refreshTokenRepository.create(refreshToken);
  }
  save(refreshToken: RefreshToken): Promise<RefreshToken> {
    return this.refreshTokenRepository.save(refreshToken);
  }
  delete(userId: string, token: string): void {
    this.refreshTokenRepository.delete({
      userId: userId,
      hashedRefreshToken: token,
    });
  }
}
