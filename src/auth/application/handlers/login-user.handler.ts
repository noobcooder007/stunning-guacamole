import { Inject } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';
import { Session } from '@/auth/domain/aggregates/session.aggregate';
import { AuthResponse } from '@/auth/application/dto/auth.response';
import { BaseCommandHandler } from '@/shared/application/handler/base-command.handler';
import { CommandMetadata } from '@/shared/application/dto/command-metadata.dto';
import { IPasswordHasher } from '@/auth/domain/services/password.hasher.service';
import { JWTService } from '@/auth/application/services/jwt.service';
import { LoginUserCommand } from '@/auth/application/commands/login-user.command';
import { IDataHasher } from '@/auth/domain/services/data-hasher.service';
import { IUserRepository } from '@/auth/application/repositories/user.repository';
import { ISessionRepository } from '@/auth/application/repositories/session.repository';
import { IRoleRepository } from '@/auth/application/repositories/role.repository';
import { IPermissionRepository } from '@/auth/application/repositories/permission.repository';
import { REPOSITORY_TOKENS } from '@/database/infrastructure/persistence';
import { ErrorType, Result } from '@/shared/domain/dto/result.dto';
import { User } from '@/auth/domain/aggregates/user.aggregate';
import { SessionId } from '@/auth/domain/aggregates/session.aggregate';
import { RefreshTokenHash } from '@/auth/domain/value-objects/refresh-token-hash.vo';
import { ExpiresAtDate } from '@/auth/domain/value-objects/expires-at-date.vo';
import { SessionMetadata } from '@/auth/domain/value-objects/session-metadata.vo';

export interface TokenResult {
  rawAccessToken: string;
  rawRefreshToken: string;
  sessionId: string;
  role: string;
}

@CommandHandler(LoginUserCommand)
export class LoginUserHandler extends BaseCommandHandler<
  LoginUserCommand,
  AuthResponse
> {
  constructor(
    @Inject(REPOSITORY_TOKENS.USER)
    private readonly userRepository: IUserRepository,
    @Inject(REPOSITORY_TOKENS.SESSION)
    private readonly sessionRepository: ISessionRepository,
    @Inject(REPOSITORY_TOKENS.ROLES)
    private readonly roleRepository: IRoleRepository,
    @Inject(REPOSITORY_TOKENS.PERMISSION)
    private readonly permissionRepository: IPermissionRepository,
    @Inject('IPasswordHasher')
    private readonly hasherService: IPasswordHasher,
    @Inject('ITokenHasher')
    private readonly hasherTokenService: IDataHasher,
    private readonly jwtService: JWTService,
  ) {
    super();
  }

  protected async process(
    command: LoginUserCommand,
    context?: CommandMetadata,
  ): Promise<Result<AuthResponse>> {
    const user = await this.userRepository.findOneByUsername(command.username);
    if (!user) {
      return Result.fail({
        type: ErrorType.UNAUTHORIZED,
        message: 'Invalid credentials',
        entity: LoginUserHandler.name,
      });
    }
    const isValidPassword = await user.validatePassword(
      this.hasherService,
      command.password,
    );
    if (!isValidPassword) {
      return Result.fail({
        type: ErrorType.UNAUTHORIZED,
        message: 'Invalid credentials',
        entity: LoginUserHandler.name,
      });
    }
    const { rawAccessToken, rawRefreshToken, sessionId, role } =
      await this.generateTokens(user, context);
    const session = new AuthResponse();
    session.user = {
      username: user.username,
      role: role,
    };
    session.tokens = {
      accessToken: rawAccessToken,
      refreshToken: rawRefreshToken,
      expiresIn: Number(
        new Date(Date.now() + this.jwtService.ACCESSTOKENVALIDITYMS),
      ),
      refreshExpiresIn: Number(
        new Date(Date.now() + this.jwtService.REFRESHTOKENVALIDITYMS),
      ),
      sessionId: sessionId.toString(),
    };
    return Result.ok<AuthResponse>(session);
  }

  private async generateTokens(
    user: User,
    context: CommandMetadata,
  ): Promise<TokenResult> {
    const sessionId = SessionId.create();
    user.updateLastLogin();
    const [role, permissions] = await Promise.all([
      this.roleRepository.findById(user.role.unpack()),
      this.permissionRepository.findByRoleId(user.role.unpack()),
      this.userRepository.save(user),
    ]);
    const rawAccessToken = this.jwtService.createAccessToken({
      id: user._id.unpack(),
      role: role.name,
      rights: permissions.map((p) => p.name),
      gender: user.gender,
    });
    const rawRefreshToken = this.jwtService.createRefreshToken({
      id: user._id.unpack(),
      sessionId: sessionId.unpack(),
    });
    const hashedRefreshToken =
      await this.hasherTokenService.hash(rawRefreshToken);
    const expiresAtDate = new Date(
      Date.now() + this.jwtService.REFRESHTOKENVALIDITYMS,
    );
    const sessionMetadata = SessionMetadata.of({
      ip: context.ip,
      userAgent: context.userAgent,
    });
    const session = Session.create({
      sessionId,
      userId: user._id,
      hashRefreshToken: RefreshTokenHash.of(hashedRefreshToken),
      expiresAt: ExpiresAtDate.of(expiresAtDate),
      createdAt: new Date(),
      sessionMetadata: sessionMetadata,
    });
    await this.sessionRepository.save(session);
    return {
      rawAccessToken,
      rawRefreshToken,
      sessionId: session.sessionId.unpack(),
      role: role.name,
    };
  }
}
