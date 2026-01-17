import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { User } from '@/auth/domain/aggregates/user.aggregate';
import { REPOSITORY_TOKENS } from '@/database/infrastructure/persistence';
import { IUserRepository } from '@/auth/application/repositories/user.repository';
import { AccessJwtPayload } from '@/auth/application/services/jwt.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(REPOSITORY_TOKENS.USER)
    private readonly userRepository: IUserRepository,
    configService: ConfigService,
  ) {
    super({
      secretOrKey: configService.get('JWT_SECRET'),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  async validate(payload: AccessJwtPayload): Promise<User> {
    const { id } = payload;
    const user = await this.userRepository.findOneById(id);
    if (!user) throw new UnauthorizedException('Invalid token');
    if (!user.isActive) throw new UnauthorizedException('User is inactive');
    return user;
  }
}
