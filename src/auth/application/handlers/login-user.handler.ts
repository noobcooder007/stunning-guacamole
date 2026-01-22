import { Inject } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';
import { Session } from '@/auth/domain/aggregates/session.aggregate';
import { AuthResponse, SessionDto } from '@/auth/application/dto/auth.response';
import { BaseCommandHandler } from '@/shared/application/handler/base-command.handler';
import { CommandMetadata } from '@/shared/application/dto/command-metadata.dto';
import { IPasswordHasher } from '@/auth/domain/services/password.hasher.service';
import { JWTService } from '@/auth/application/services/jwt.service';
import { LoginUserCommand } from '@/auth/application/commands/login-user.command';
import { ITokenHasher } from '@/auth/domain/services/token-hasher.service';
import { IUserRepository } from '@/auth/application/repositories/user.repository';
import { ISessionRepository } from '@/auth/application/repositories/session.repository';
import { IRoleRepository } from '@/auth/application/repositories/role.repository';
import { IPermissionRepository } from '@/auth/application/repositories/permission.repository';
import { REPOSITORY_TOKENS } from '@/database/infrastructure/persistence';
import { ErrorType, Result } from '@/shared/domain/dto/result.dto';
import { User } from '@/auth/domain/aggregates/user.aggregate';
import { UserDto } from '@/auth/application/dto/auth.response';
import { SessionId } from '@/auth/domain/aggregates/session.aggregate';
import { RefreshTokenHash } from '@/auth/domain/value-objects/refresh-token-hash.vo';
import { ExpiresAtDate } from '@/auth/domain/value-objects/expires-at-date.vo';
import { SessionMetadata } from '@/auth/domain/value-objects/session-metadata.vo';
import { Role } from '@/auth/domain/aggregates/role.aggregate';

export interface TokenResult {
  rawAccessToken: string;
  rawRefreshToken: string;
  sessionId: string;
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
    private readonly hasherTokenService: ITokenHasher,
    private readonly jwtService: JWTService,
  ) {
    super();
  }

  protected async process(
    command: LoginUserCommand,
    context?: CommandMetadata,
  ): Promise<Result<AuthResponse>> {
    const { isSuccess, error, value: user } = await this.validateUser(command);
    if (!isSuccess) {
      return Result.fail({
        type: error.type,
        message: error.message,
        entity: LoginUserHandler.name,
      });
    }
    const role = await this.roleRepository.findById(user.role.unpack());
    const { rawAccessToken, rawRefreshToken, sessionId } =
      await this.generateTokens(user, role, context);
    user.updateLastLogin();
    this.userRepository.save(user);
    const session = new AuthResponse({
      user: new UserDto({
        username: user.username,
        role: role.name,
      }),
      tokens: new SessionDto({
        accessToken: rawAccessToken,
        refreshToken: rawRefreshToken,
        expiresIn: Number(
          new Date(Date.now() + this.jwtService.ACCESSTOKENVALIDITYMS),
        ),
        refreshExpiresIn: Number(
          new Date(Date.now() + this.jwtService.REFRESHTOKENVALIDITYMS),
        ),
        sessionId: sessionId.toString(),
      }),
    });
    return Result.ok<AuthResponse>(session);
  }

  private async validateUser(command: LoginUserCommand): Promise<Result<User>> {
    const { username, password } = command;
    const user = await this.userRepository.findOneByUsername(username);
    if (!user)
      return Result.fail({
        type: ErrorType.UNAUTHORIZED,
        message: 'Invalid credentials',
        entity: LoginUserHandler.name,
      });
    const isValidUser = await user.validatePassword(
      this.hasherService,
      password,
    );
    if (!isValidUser)
      return Result.fail({
        type: ErrorType.UNAUTHORIZED,
        message: 'Invalid credentials or account disabled',
        entity: LoginUserHandler.name,
      });
    return Result.ok(user);
  }

  private async generateTokens(
    user: User,
    role: Role,
    context: CommandMetadata,
  ): Promise<TokenResult> {
    const sessionId = SessionId.create();
    const permissions = await this.permissionRepository.findByRoleId(
      role._id.unpack(),
    );
    const rawAccessToken = this.jwtService.createAccessToken({
      id: user._id.unpack(),
      rights: permissions.map((p) => p.name),
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
    };
  }
}
