import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { LoginUserDto } from '@/auth/infrastructure/dto/login-user.dto';
import { CreateUserDto } from '@/auth/infrastructure/dto/create-user.dto';
import { RoleService } from '@/auth/domain/services/role.service';
import { AccessJwtPayload } from '@/auth/domain/value-objects/jwt-payload.vo';
import { PermissionService } from '@/auth/domain/services/permission.service';
import type { PairToken } from '@/auth/infrastructure/dto/pair-token.dto';
import { UserService } from '@/auth/domain/services/user.service';
import { User } from '@/auth/domain/aggregates/user.aggregate';
import { RefreshTokenService } from '@/auth/domain/services/refresh-token.service';
import { AuthResponse } from '@/auth/domain/entities/auth-response.entity';
import { RefreshToken } from '../value-objects/refresh-token.vo';
import { RefreshTokenRequest } from '@/auth/infrastructure/dto/refresh-token.dto';
import { RefreshJwtPayload } from '../value-objects/refresh-jwt-payload.vo';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly roleService: RoleService,
    private readonly permissionService: PermissionService,
    private readonly refreshTokenService: RefreshTokenService,
    private readonly jwtService: JwtService,
  ) {}

  private accessTokenValidityMs = 15 * 60 * 1000;
  private refreshTokenValidityMs = 30 * 24 * 60 * 60 * 1000;

  public async login(
    loginUserDto: LoginUserDto,
    ip: string,
    userAgent: string,
  ): Promise<AuthResponse> {
    const { username, password } = loginUserDto;
    const user = await this.getUserByUsername(username);
    this.verifyPassword(password, user.password);
    const permitions = await this.getPermitionsByRoleId(user.role.id);
    const sessionId = crypto.randomUUID();
    const accessToken = this.getAccessJwtToken(
      {
        id: user.id,
        rights: permitions?.map((permit) => {
          return permit.name;
        }),
      },
      this.accessTokenValidityMs,
    );
    const refreshToken = this.getRefreshJwtToken(
      {
        id: user.id,
        sessionId: sessionId,
      },
      this.refreshTokenValidityMs,
    );
    this.updateLastLogin(user.id);
    await this.storeRefreshToken(
      sessionId,
      user.id,
      refreshToken,
      ip,
      userAgent,
    );
    return {
      user: {
        username: user.username,
        role: user.role.name,
      },
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: new Date(Date.now() + this.accessTokenValidityMs),
        refreshExpiresIn: new Date(Date.now() + this.refreshTokenValidityMs),
        sessionId,
      },
    };
  }

  public async register(createUserDto: CreateUserDto) {
    const { username, password, roleId } = createUserDto;
    const role = await this.roleService.findById(roleId);
    if (!role || !role.isActive) {
      throw new NotFoundException('El rol no existe o ya no esta activo');
    }
    const user = this.userService.create({
      username,
      role: role,
      password: bcrypt.hashSync(password, bcrypt.genSaltSync()),
    });
    await this.userService.save(user);
  }

  private getAccessJwtToken(
    payload: AccessJwtPayload,
    expiryMs: number,
  ): string {
    return this.jwtService.sign(payload, {
      expiresIn: Math.floor(expiryMs / 1000),
    });
  }

  private getRefreshJwtToken(
    payload: RefreshJwtPayload,
    expiryMs: number,
  ): string {
    return this.jwtService.sign(payload, {
      expiresIn: Math.floor(expiryMs / 1000),
    });
  }

  private async getUserById(id: string): Promise<User> {
    const user = await this.userService.findById(id);
    return user;
  }

  private async getUserByUsername(username: string): Promise<User> {
    const user = await this.userService.findByUsername(username);
    if (!user || !user.isActive)
      throw new UnauthorizedException('Credenciales inválidas');
    if (!user.role || user.role.isActive === false)
      throw new NotFoundException(
        'El usuario no tiene un rol activo, consulta al administrador',
      );
    return user;
  }

  private verifyPassword(password: string, hashedPassword: string): boolean {
    if (!bcrypt.compareSync(password, hashedPassword))
      throw new UnauthorizedException('Credenciales inválidas');
    return true;
  }

  private async getPermitionsByRoleId(roleId: string) {
    const permitions = await this.permissionService.findByRoleId(roleId);
    return permitions.filter((permit) => permit.isActive);
  }

  private updateLastLogin(userId: string): void {
    this.userService.updateLastLogin(userId);
  }

  public async refreshToken(
    refreshTokenRequest: RefreshTokenRequest,
  ): Promise<PairToken> {
    const { refreshToken, sessionId: sessionIdFromRequest } =
      refreshTokenRequest;
    const isValidToken = this.jwtService.verifyAsync(refreshToken);
    if (!isValidToken) throw new UnauthorizedException('Token inválido');
    const { id: userId, sessionId: sessionIdFromToken } =
      this.jwtService.decode(refreshToken) as RefreshJwtPayload;
    if (sessionIdFromRequest !== sessionIdFromToken)
      throw new UnauthorizedException('Token inválido');
    const user = await this.getUserById(userId);
    if (!user || !user.isActive)
      throw new UnauthorizedException('Usuario desactivado o no existe');
    const hashedRefreshToken = this.hashToken(refreshToken);
    const currentRefreshToken =
      await this.refreshTokenService.findOneByUserIdAndHashedRefreshTokenAndSessionId(
        userId,
        hashedRefreshToken,
        sessionIdFromRequest,
      );
    const permitions = await this.getPermitionsByRoleId(user.role.id);
    const newAccessToken = this.getAccessJwtToken(
      {
        id: userId,
        rights: permitions?.map((permit) => {
          return permit.name;
        }),
      },
      this.accessTokenValidityMs,
    );
    const newRefreshToken = this.getRefreshJwtToken(
      { id: userId, sessionId: sessionIdFromRequest },
      this.refreshTokenValidityMs,
    );
    this.updateRefreshToken(currentRefreshToken, newRefreshToken);
    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  private async storeRefreshToken(
    sessionId: string,
    userId: string,
    rawRefreshToken: string,
    ip?: string,
    userAgent?: string,
  ): Promise<string> {
    const hashedRefreshToken = this.hashToken(rawRefreshToken);
    const expiresAt = new Date(Date.now() + this.refreshTokenValidityMs);
    const refreshToken = new RefreshToken()
      .setSessionId(sessionId)
      .setUserId(userId)
      .setHashRefreshToken(hashedRefreshToken)
      .setExpiresAt(expiresAt)
      .setCreatedAt(new Date())
      .setIp(ip)
      .setUserAgent(userAgent)
      .build();
    const refreshTokenModel = this.refreshTokenService.create(refreshToken);
    const newRefreshToken =
      await this.refreshTokenService.save(refreshTokenModel);
    return newRefreshToken.sessionId;
  }

  private async updateRefreshToken(
    currentRefreshToken: RefreshToken,
    newRefreshToken: string,
  ): Promise<void> {
    const hashedRefreshToken = this.hashToken(newRefreshToken);
    const expiresAt = new Date(Date.now() + this.refreshTokenValidityMs);
    const refreshToken = new RefreshToken()
      .setSessionId(currentRefreshToken.sessionId)
      .setUserId(currentRefreshToken.userId)
      .setHashRefreshToken(hashedRefreshToken)
      .setExpiresAt(expiresAt)
      .setCreatedAt(currentRefreshToken.createdAt)
      .setIp(currentRefreshToken.ip)
      .setUserAgent(currentRefreshToken.userAgent)
      .build();
    const refreshTokenModel = this.refreshTokenService.create(refreshToken);
    await this.refreshTokenService.upsert(refreshTokenModel);
  }

  private hashToken(token: string): string {
    const digest = crypto.createHash('sha256');
    digest.update(token, 'utf8');
    return digest.digest('base64');
  }
}
