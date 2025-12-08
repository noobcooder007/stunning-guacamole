import {
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { LoginUserDto } from '@/auth/infrastructure/dto/login-user.dto';
import { CreateUserDto } from '@/auth/infrastructure/dto/create-user.dto';
import { UserRepository } from '@/auth/domain/repositories/user.repository';
import { RoleService } from '@/auth/domain/services/role.service';
import { JwtPayload } from '@/auth/domain/value-objects/jwt-payload.vo';
import { PermitService } from '@/auth/domain/services/permit.service';
import type { PairToken } from '@/auth/infrastructure/dto/pair-token.dto';
import { UserModel } from '@/auth/infrastructure/models/user.model';
import { RefreshTokenRepository } from '@/auth/domain/repositories/refresh-token.repository';

@Injectable()
export class AuthService {
  constructor(
    @Inject(UserRepository)
    private readonly userRepository: UserRepository,
    private readonly roleService: RoleService,
    private readonly permitService: PermitService,
    @Inject(RefreshTokenRepository)
    private readonly refreshTokenRepository: RefreshTokenRepository,
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
    const { username, password, role } = createUserDto;
    const roleModel = await this.roleService.findById(role);
    if (!roleModel || !roleModel.isActive) {
      throw new NotFoundException('El rol no existe o ya no esta activo');
    }
    const user = this.userRepository.create({
      username,
      role: roleModel,
      password: bcrypt.hashSync(password, bcrypt.genSaltSync()),
    });
    await this.userRepository.save(user);
  }

  private getJwtToken(payload: JwtPayload): string {
    return this.jwtService.sign(payload);
  }

  private async getUserById(id: string): Promise<UserModel> {
    const user = await this.userRepository.findOneById(id);
    return user;
  }

  private async getUserByUsername(username: string): Promise<UserModel> {
    const user = await this.userRepository.findOneByUsername(username);
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
    const permitions = await this.permitService.findByRoleId(roleId);
    return permitions.filter((permit) => permit.isActive);
  }

  private updateLastLogin(userId: string): void {
    this.userRepository.updateLastLogin(userId);
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
      await this.refreshTokenRepository.findOneByUserIdAndHashedRefreshToken(
        id,
        hashedRefreshToken,
      );
    if (!currentRefreshToken)
      throw new UnauthorizedException(
        'Token inválido (tal vez fue usado o expirado)',
      );
    this.refreshTokenRepository.delete(
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
    const newRefreshToken = this.refreshTokenRepository.create({
      userId,
      hashedRefreshToken,
      expiresAt,
    });
    this.refreshTokenRepository.save(newRefreshToken);
  }

  private hashToken(token: string): string {
    const digest = crypto.createHash('sha256');
    digest.update(token, 'utf8');
    return digest.digest('base64');
  }
}
