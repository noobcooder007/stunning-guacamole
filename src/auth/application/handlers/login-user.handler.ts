import { Inject } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';
import { SessionId, Session } from '@/auth/domain/entities/session.entity';
import { AuthResponse, SessionDto } from '@/auth/application/dto/auth.response';
import { BaseCommandHandler } from '@/shared/application/handler/base-command.handler';
import { CommandMetadata } from '@/shared/application/dto/command-metadata.dto';
import { hashToken } from '@/shared/infrastructure/services/hash-token.service';
import { IPasswordHasher } from '@/auth/domain/services/password.hasher';
import { JWTService } from '@/auth/application/services/jwt.service';
import { LoginUserCommand } from '@/auth/application/commands/login-user.command';
import { SessionRepository } from '@/auth/domain/repositories/session.repository';
import { REPOSITORY_TOKENS } from '@/database/infrastructure/persistence';
import { ErrorType, Result } from '@/shared/domain/dto/result.dto';
import { User } from '@/auth/domain/aggregates/user.aggregate';
import { UserRepository } from '@/auth/domain/repositories/user.repository';
import { UserDto } from '../dto/auth.response';

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
    private readonly userRepository: UserRepository,
    @Inject(REPOSITORY_TOKENS.SESSION)
    private readonly sessionRepository: SessionRepository,
    @Inject('IPasswordHasher')
    private readonly hasherService: IPasswordHasher,
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
    const { rawAccessToken, rawRefreshToken, sessionId } =
      await this.generateTokens(user, context);
    user.updateLastLogin();
    this.userRepository.save(user);
    const session = new AuthResponse({
      user: new UserDto({
        username: user.username,
        role: user.role.name,
      }),
      tokens: new SessionDto({
        accessToken: rawAccessToken,
        refreshToken: rawRefreshToken,
        expiresIn: Number(
          new Date(Date.now() + this.jwtService.ACCESSTOKENVALIDITYMS),
        ),
        refreshExpiresIn: Number(
          new Date(Date.now() + this.jwtService.sessionVALIDITYMS),
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
    if (!user.isActive)
      return Result.fail({
        type: ErrorType.FORBIDDEN,
        message: 'User desactivated',
        entity: LoginUserHandler.name,
      });
    const isEquals = await this.hasherService.compare(password, user.password);
    if (!isEquals)
      return Result.fail({
        type: ErrorType.UNAUTHORIZED,
        message: 'Invalid credentials',
        entity: LoginUserHandler.name,
      });
    return Result.ok(user);
  }

  private async generateTokens(
    user: User,
    context: CommandMetadata,
  ): Promise<TokenResult> {
    const sessionId = SessionId.of();
    const permissionsName = user.role.permissions.map(
      (permission) => permission.name,
    );
    const rawAccessToken = this.jwtService.createAccessToken({
      id: user._id,
      rights: permissionsName,
    });
    const rawRefreshToken = this.jwtService.createRefreshToken({
      id: user._id,
      sessionId: sessionId.toString(),
    });
    const session = Session.create({
      sessionId,
      userId: user._id,
      hashRefreshToken: hashToken(rawRefreshToken),
      expiresAt: new Date(Date.now() + this.jwtService.sessionVALIDITYMS),
      createdAt: new Date(),
      ip: context.ip,
      userAgent: context.userAgent,
    });
    await this.sessionRepository.save(session);
    return {
      rawAccessToken,
      rawRefreshToken,
      sessionId: session.sessionId,
    };
  }
}
