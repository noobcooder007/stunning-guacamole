import { Inject } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';
import {
  AuthResponse,
  SessionDto,
  UserDto,
} from '@/auth/application/dto/auth.response';
import { BaseCommandHandler } from '@/shared/application/handler/base-command.handler';
import { CommandMetadata } from '@/shared/application/dto/command-metadata.dto';
import { JWTService } from '@/auth/application/services/jwt.service';
import { SessionCommand } from '@/auth/application/commands/session.command';
import { ISessionRepository } from '@/auth/application/repositories/session.repository';
import { REPOSITORY_TOKENS } from '@/database/infrastructure/persistence';
import { ErrorType, Result } from '@/shared/domain/dto/result.dto';
import { User } from '@/auth/domain/aggregates/user.aggregate';
import { IUserRepository } from '@/auth/application/repositories/user.repository';
import { RefreshTokenHash } from '@/auth/domain/value-objects/refresh-token-hash.vo';
import { ExpiresAtDate } from '@/auth/domain/value-objects/expires-at-date.vo';
import { ITokenHasher } from '@/auth/domain/services/token-hasher.service';
import { Role } from '@/auth/domain/aggregates/role.aggregate';
import { IRoleRepository } from '../repositories/role.repository';

export interface TokenResult {
  rawAccessToken: string;
  rawRefreshToken: string;
  sessionId: string;
}

export interface TokenData {
  userId: string;
  sessionIdFromRequest: string;
}

@CommandHandler(SessionCommand)
export class SessionHandler extends BaseCommandHandler<
  SessionCommand,
  AuthResponse
> {
  constructor(
    @Inject(REPOSITORY_TOKENS.USER)
    private readonly userRepository: IUserRepository,
    @Inject(REPOSITORY_TOKENS.ROLES)
    private readonly roleRepository: IRoleRepository,
    @Inject(REPOSITORY_TOKENS.SESSION)
    private readonly sessionRepository: ISessionRepository,
    @Inject('ITokenHasher')
    private readonly hasherService: ITokenHasher,
    private readonly jwtService: JWTService,
  ) {
    super();
  }

  protected async process(
    command: SessionCommand,
    context?: CommandMetadata,
  ): Promise<Result<AuthResponse>> {
    const resultTokenData = await this.verifyTokenWithSession(command, context);
    if (!resultTokenData.isSuccess) {
      return Result.fail({
        type: resultTokenData.error.type,
        message: resultTokenData.error.message,
        entity: SessionHandler.name,
      });
    }
    const user = await this.userRepository.findOneById(
      resultTokenData.value.userId,
    );
    if (!user) {
      return Result.fail({
        type: ErrorType.NOT_FOUND,
        message: 'User desactivated or not found',
        entity: SessionHandler.name,
      });
    }
    const role = await this.roleRepository.findById(user.role);
    const resultTokenResult = await this.generateTokens(
      user,
      role,
      context,
      resultTokenData.value.sessionIdFromRequest,
    );
    if (!resultTokenResult.isSuccess) {
      return Result.fail({
        type: resultTokenResult.error.type,
        message: resultTokenResult.error.message,
        entity: SessionHandler.name,
      });
    }
    const session = new AuthResponse({
      user: new UserDto({
        username: user.username,
        role: role.name,
      }),
      tokens: new SessionDto({
        accessToken: resultTokenResult.value.rawAccessToken,
        refreshToken: resultTokenResult.value.rawRefreshToken,
        expiresIn: Number(
          new Date(Date.now() + this.jwtService.ACCESSTOKENVALIDITYMS),
        ),
        refreshExpiresIn: Number(
          new Date(Date.now() + this.jwtService.REFRESHTOKENVALIDITYMS),
        ),
        sessionId: resultTokenResult.value.sessionId.toString(),
      }),
    });
    return Result.ok<AuthResponse>(session);
  }

  private async verifyTokenWithSession(
    command: SessionCommand,
    context: CommandMetadata,
  ): Promise<Result<TokenData>> {
    const { sessionId: sessionIdFromRequest } = command;
    const payload = this.jwtService.verify(context.refreshToken);
    const { id: userId, sessionId: sessionIdFromToken } = payload;
    if (sessionIdFromRequest !== sessionIdFromToken)
      return Result.fail({
        type: ErrorType.UNAUTHORIZED,
        message: 'Session not found',
        entity: SessionHandler.name,
      });
    return Result.ok({
      userId,
      sessionIdFromRequest,
    });
  }

  private async generateTokens(
    user: User,
    role: Role,
    context: CommandMetadata,
    sessionIdFromRequest: string,
  ): Promise<Result<TokenResult>> {
    const rawRefreshToken = context.refreshToken;
    const currentSession =
      await this.sessionRepository.findOneByUserIdAndSessionId(
        user._id,
        sessionIdFromRequest,
      );
    if (!currentSession) {
      return Result.fail({
        type: ErrorType.UNAUTHORIZED,
        message: 'Invalid token (maybe was used or expired)',
        entity: SessionHandler.name,
      });
    }
    const isValid = await currentSession.validateToken(
      rawRefreshToken,
      context.userAgent,
      this.hasherService,
    );
    if (!isValid) {
      currentSession.revokeSession();
      await this.sessionRepository.save(currentSession);
      return Result.fail({
        type: ErrorType.UNAUTHORIZED,
        message: 'Invalid token (maybe was used or expired)',
        entity: SessionHandler.name,
      });
    }
    const permissions = role.permissions.map((permission) => permission.name);
    const newAccessToken = this.jwtService.createAccessToken({
      id: user._id,
      rights: permissions,
    });
    const newRawRefreshToken = this.jwtService.createRefreshToken({
      id: user._id,
      sessionId: sessionIdFromRequest,
    });
    const newHashedsession = await this.hasherService.hash(newRawRefreshToken);
    const refreshTokenHash = RefreshTokenHash.of(newHashedsession);
    const expiresAt = new Date(
      Date.now() + this.jwtService.REFRESHTOKENVALIDITYMS,
    );
    const expiresAtDate = ExpiresAtDate.of(expiresAt);
    currentSession.updateSession(refreshTokenHash, expiresAtDate);
    await this.sessionRepository.save(currentSession);
    return Result.ok<TokenResult>({
      rawAccessToken: newAccessToken,
      rawRefreshToken: newRawRefreshToken,
      sessionId: currentSession.sessionId.unpack(),
    });
  }
}
