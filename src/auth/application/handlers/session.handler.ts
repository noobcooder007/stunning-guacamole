import { Inject } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';
import { AuthResponse } from '@/auth/application/dto/auth.response';
import { BaseCommandHandler } from '@/shared/application/handler/base-command.handler';
import { CommandMetadata } from '@/shared/application/dto/command-metadata.dto';
import { JWTService } from '@/auth/application/services/jwt.service';
import { RefreshSessionCommand } from '@/auth/application/commands/refresh-session.command';
import { ISessionRepository } from '@/auth/application/repositories/session.repository';
import { REPOSITORY_TOKENS } from '@/database/infrastructure/persistence';
import { ErrorType, Result } from '@/shared/domain/dto/result.dto';
import { User } from '@/auth/domain/aggregates/user.aggregate';
import { IUserRepository } from '@/auth/application/repositories/user.repository';
import { IRoleRepository } from '@/auth/application/repositories/role.repository';
import { IPermissionRepository } from '@/auth/application/repositories/permission.repository';
import { RefreshTokenHash } from '@/auth/domain/value-objects/refresh-token-hash.vo';
import { ExpiresAtDate } from '@/auth/domain/value-objects/expires-at-date.vo';
import { IDataHasher } from '@/auth/domain/services/data-hasher.service';
import { Session } from '@/auth/domain/aggregates/session.aggregate';

export interface TokenResult {
  rawAccessToken: string;
  rawRefreshToken: string;
  sessionId: string;
  roleName: string;
}

export interface TokenData {
  userId: string;
  sessionIdFromRequest: string;
}

@CommandHandler(RefreshSessionCommand)
export class SessionHandler extends BaseCommandHandler<
  RefreshSessionCommand,
  AuthResponse
> {
  constructor(
    @Inject(REPOSITORY_TOKENS.USER)
    private readonly userRepository: IUserRepository,
    @Inject(REPOSITORY_TOKENS.ROLES)
    private readonly roleRepository: IRoleRepository,
    @Inject(REPOSITORY_TOKENS.PERMISSION)
    private readonly permissionRepository: IPermissionRepository,
    @Inject(REPOSITORY_TOKENS.SESSION)
    private readonly sessionRepository: ISessionRepository,
    @Inject('ITokenHasher')
    private readonly hasherService: IDataHasher,
    private readonly jwtService: JWTService,
  ) {
    super();
  }

  protected async process(
    command: RefreshSessionCommand,
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
    const userId = resultTokenData.value.userId;
    const [user, currentSession] = await Promise.all([
      this.userRepository.findOneById(userId),
      this.sessionRepository.findOneByUserIdAndSessionId(
        userId,
        resultTokenData.value.sessionIdFromRequest,
      ),
    ]);
    if (!user || !currentSession) {
      return Result.fail({
        type: ErrorType.NOT_FOUND,
        message: 'User or session not found',
        entity: SessionHandler.name,
      });
    }
    const resultTokenResult = await this.generateTokens(
      user,
      currentSession,
      context,
    );
    if (!resultTokenResult.isSuccess) {
      return Result.fail({
        type: resultTokenResult.error.type,
        message: resultTokenResult.error.message,
        entity: SessionHandler.name,
      });
    }
    const session = new AuthResponse();
    session.user = {
      username: user.username,
      role: resultTokenResult.value.roleName,
    };
    session.tokens = {
      accessToken: resultTokenResult.value.rawAccessToken,
      refreshToken: resultTokenResult.value.rawRefreshToken,
      expiresIn: Number(
        new Date(Date.now() + this.jwtService.ACCESSTOKENVALIDITYMS),
      ),
      refreshExpiresIn: Number(
        new Date(Date.now() + this.jwtService.REFRESHTOKENVALIDITYMS),
      ),
      sessionId: resultTokenResult.value.sessionId.toString(),
    };
    return Result.ok<AuthResponse>(session);
  }

  private async verifyTokenWithSession(
    command: RefreshSessionCommand,
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
    currentSession: Session,
    context: CommandMetadata,
  ): Promise<Result<TokenResult>> {
    const rawRefreshToken = context.refreshToken;
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
    const [role, permissions] = await Promise.all([
      this.roleRepository.findById(user.role.unpack()),
      this.permissionRepository.findByRoleId(user.role.unpack()),
    ]);
    const newAccessToken = this.jwtService.createAccessToken({
      id: user._id.unpack(),
      rights: permissions.map((p) => p.name),
    });
    const newRawRefreshToken = this.jwtService.createRefreshToken({
      id: user._id.unpack(),
      sessionId: currentSession.sessionId.unpack(),
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
      roleName: role.name,
    });
  }
}
