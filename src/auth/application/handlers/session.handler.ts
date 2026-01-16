import { Inject } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';
import {
  AuthResponse,
  SessionDto,
  UserDto,
} from '@/auth/application/dto/auth.response';
import { BaseCommandHandler } from '@/shared/application/handler/base-command.handler';
import { CommandMetadata } from '@/shared/application/dto/command-metadata.dto';
import { hashToken } from '@/shared/infrastructure/services/hash-token.service';
import { JWTService } from '@/auth/application/services/jwt.service';
import { RefreshJwtPayload } from '@/auth/domain/value-objects/refresh-jwt-payload.vo';
import { SessionCommand } from '@/auth/application/commands/session.command';
import { SessionRepository } from '@/auth/domain/repositories/session.repository';
import { REPOSITORY_TOKENS } from '@/database/infrastructure/persistence';
import { ErrorType, Result } from '@/shared/domain/dto/result.dto';
import { User } from '@/auth/domain/aggregates/user.aggregate';
import { UserRepository } from '@/auth/domain/repositories/user.repository';
import { safeCompare } from '@/shared/infrastructure/security/safe-compare';

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
    private readonly userRepository: UserRepository,
    @Inject(REPOSITORY_TOKENS.SESSION)
    private readonly sessionRepository: SessionRepository,
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
    const resultTokenResult = await this.generateTokens(
      user,
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
        role: user.role.name,
      }),
      tokens: new SessionDto({
        accessToken: resultTokenResult.value.rawAccessToken,
        refreshToken: resultTokenResult.value.rawRefreshToken,
        expiresIn: Number(
          new Date(Date.now() + this.jwtService.ACCESSTOKENVALIDITYMS),
        ),
        refreshExpiresIn: Number(
          new Date(Date.now() + this.jwtService.sessionVALIDITYMS),
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
    const isValidToken = await this.jwtService.verifyAsync(
      context.refreshToken,
    );
    if (!isValidToken)
      return Result.fail({
        type: ErrorType.UNAUTHORIZED,
        message: 'Invalid token',
        entity: SessionHandler.name,
      });
    const { id: userId, sessionId: sessionIdFromToken } =
      this.jwtService.decode(context.refreshToken) as RefreshJwtPayload;
    if (sessionIdFromRequest !== sessionIdFromToken)
      return Result.fail({
        type: ErrorType.UNAUTHORIZED,
        message: 'Invalid token',
        entity: SessionHandler.name,
      });
    return Result.ok({
      userId,
      sessionIdFromRequest,
    });
  }

  private async generateTokens(
    user: User,
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
    if (currentSession.revoked) {
      return Result.fail({
        type: ErrorType.UNAUTHORIZED,
        message: 'Invalid token (maybe was used or expired)',
        entity: SessionHandler.name,
      });
    }
    const isMatch = await safeCompare(
      hashToken(rawRefreshToken),
      currentSession.hashRefreshToken,
    );
    if (!isMatch) {
      currentSession.revoked = true;
      await this.sessionRepository.save(currentSession);
      return Result.fail({
        type: ErrorType.UNAUTHORIZED,
        message: 'Invalid token (maybe was used or expired)',
        entity: SessionHandler.name,
      });
    }
    const permissions = user.role.permissions.map(
      (permission) => permission.name,
    );
    const newAccessToken = this.jwtService.createAccessToken({
      id: user._id,
      rights: permissions,
    });
    const newRawRefreshToken = this.jwtService.createRefreshToken({
      id: user._id,
      sessionId: sessionIdFromRequest,
    });
    const newHashedsession = hashToken(newRawRefreshToken);
    const expiresAt = new Date(Date.now() + this.jwtService.sessionVALIDITYMS);
    currentSession.updateSession(newHashedsession, expiresAt);
    await this.sessionRepository.save(currentSession);
    return Result.ok<TokenResult>({
      rawAccessToken: newAccessToken,
      rawRefreshToken: newRawRefreshToken,
      sessionId: currentSession.sessionId,
    });
  }
}
