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
import { JwtPayload } from '@/auth/domain/value-objects/jwt-payload.vo';
import { PermissionService } from '@/auth/domain/services/permission.service';
import type { PairToken } from '@/auth/infrastructure/dto/pair-token.dto';
import { UserService } from '@/auth/domain/services/user.service';
import { User } from '@/auth/domain/aggregates/user.aggregate';
import { RefreshTokenService } from '@/auth/domain/services/refresh-token.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly roleService: RoleService,
    private readonly permissionService: PermissionService,
    private readonly refreshTokenService: RefreshTokenService,
    private readonly jwtService: JwtService,
  ) {}

  public async login(loginUserDto: LoginUserDto): Promise<PairToken> {
    const { username, password } = loginUserDto;
    const user = await this.getUserByUsername(username);
    this.verifyPassword(password, user.password);
    const permitions = await this.getPermitionsByRoleId(user.role.id);
    const accessToken = this.getJwtToken({
      id: user.id,
      rights: permitions?.map((permit) => {
        return permit.name;
      }),
    });
    const refreshToken = this.getJwtToken({
      id: user.id,
    });
    this.updateLastLogin(user.id);
    this.storeRefreshToken(user.id, refreshToken);
    return { accessToken, refreshToken };
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

  private getJwtToken(payload: JwtPayload): string {
    return this.jwtService.sign(payload);
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

  public async refreshToken(refreshToken: string): Promise<PairToken> {
    const isValidToken = this.jwtService.verifyAsync(refreshToken);
    if (!isValidToken) throw new UnauthorizedException('Token inválido');
    const { id } = this.jwtService.decode(refreshToken) as JwtPayload;
    const user = await this.getUserById(id);
    if (!user || !user.isActive)
      throw new UnauthorizedException('Usuario desactivado o no existe');
    const hashedRefreshToken = this.hashToken(refreshToken);
    const currentRefreshToken =
      await this.refreshTokenService.findOneByUserIdAndHashedRefreshToken(
        id,
        hashedRefreshToken,
      );
    this.refreshTokenService.delete(
      currentRefreshToken.userId,
      currentRefreshToken.hashedRefreshToken,
    );
    const permitions = await this.getPermitionsByRoleId(user.role.id);
    const newAccessToken = this.getJwtToken({
      id,
      rights: permitions?.map((permit) => {
        return permit.name;
      }),
    });
    const newRefreshToken = this.getJwtToken({ id });
    this.storeRefreshToken(id, newRefreshToken);
    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  private storeRefreshToken(userId: string, rawRefreshToken: string): void {
    const hashedRefreshToken = this.hashToken(rawRefreshToken);
    const expiryMs = 15 * 60 * 1000;
    const expiresAt = new Date(Date.now() + expiryMs).getTime().toString();
    const newRefreshToken = this.refreshTokenService.create({
      userId,
      hashedRefreshToken,
      expiresAt,
    });
    this.refreshTokenService.save(newRefreshToken);
  }

  private hashToken(token: string): string {
    const digest = crypto.createHash('sha256');
    digest.update(token, 'utf8');
    return digest.digest('base64');
  }
}
