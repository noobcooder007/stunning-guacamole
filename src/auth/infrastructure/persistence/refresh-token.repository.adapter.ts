import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefreshTokenRepository } from '@/auth/domain/repositories/refresh-token.repository';
import { RefreshTokenModel } from '@/auth/infrastructure/models/refresh-token.model';

@Injectable()
export class RefreshTokenRepositoryAdapter implements RefreshTokenRepository {
  constructor(
    @InjectRepository(RefreshTokenModel)
    private readonly refreshTokenRepository: Repository<RefreshTokenModel>,
  ) {}
  findOneByUserIdAndHashedRefreshToken(
    userId: string,
    token: string,
  ): Promise<RefreshTokenModel | null> {
    return this.refreshTokenRepository.findOne({
      where: {
        userId: userId,
        hashedRefreshToken: token,
      },
    });
  }
  create(refreshToken: Partial<RefreshTokenModel>): RefreshTokenModel {
    return this.refreshTokenRepository.create(refreshToken);
  }
  save(refreshToken: RefreshTokenModel): Promise<RefreshTokenModel> {
    return this.refreshTokenRepository.save(refreshToken);
  }
  delete(userId: string, token: string): void {
    this.refreshTokenRepository.delete({
      userId: userId,
      hashedRefreshToken: token,
    });
  }
}
