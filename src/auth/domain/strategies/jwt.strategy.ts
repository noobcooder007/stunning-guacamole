import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { User } from '../aggregates/user.aggregate';
import { UserService } from '../services/user.service';
import { PermissionService } from '../services/permission.service';
import { AccessJwtPayload } from '../value-objects/jwt-payload.vo';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly userService: UserService,
    private readonly permissionService: PermissionService,
    configService: ConfigService,
  ) {
    super({
      secretOrKey: configService.get('JWT_SECRET'),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  async validate(payload: AccessJwtPayload): Promise<User> {
    const { id } = payload;
    const user = await this.userService.findById(id);
    const permissions = await this.permissionService.findByRoleId(user.role.id);
    user.addPermissions(permissions);
    if (!user) throw new UnauthorizedException('Invalid token');
    if (!user.isActive) throw new UnauthorizedException('User is inactive');
    return user;
  }
}
