import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { REPOSITORY_TOKENS } from '@/database/infrastructure/persistence';
import { IUserRepository } from '@/auth/application/repositories/user.repository';
import { IRoleRepository } from '@/auth/application/repositories/role.repository';
import { AccessJwtPayload } from '@/auth/application/services/jwt.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(REPOSITORY_TOKENS.USER)
    private readonly userRepository: IUserRepository,
    @Inject(REPOSITORY_TOKENS.ROLES)
    private readonly roleRepository: IRoleRepository,
    configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: AccessJwtPayload): Promise<any> {
    const { id, rights } = payload;
    const user = await this.userRepository.findOneById(id);
    const role = await this.roleRepository.findById(user.role.unpack());
    if (!user) throw new UnauthorizedException('Invalid token');
    if (!user.isActive) throw new UnauthorizedException('User is inactive');
    return {
      id: user._id.unpack(),
      username: user.username,
      role: role.name,
      rights,
    };
  }
}
