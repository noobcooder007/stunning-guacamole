import { Inject } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';
import { CommandMetadata } from '@/shared/application/dto/command-metadata.dto';
import { BaseCommandHandler } from '@/shared/application/handler/base-command.handler';
import { ErrorType, Result } from '@/shared/domain/dto/result.dto';
import { LogoutCommand } from '@/auth/application/commands/logout.command';
import { REPOSITORY_TOKENS } from '@/database/infrastructure/persistence';
import { SessionRepository } from '@/auth/domain/repositories/session.repository';
import { safeCompare } from '@/shared/infrastructure/security/safe-compare';
import { hashToken } from '@/shared/infrastructure/services/hash-token.service';

@CommandHandler(LogoutCommand)
export class LogoutHandler extends BaseCommandHandler<LogoutCommand, void> {
  constructor(
    @Inject(REPOSITORY_TOKENS.SESSION)
    private readonly sessionRepository: SessionRepository,
  ) {
    super();
  }

  protected async process(
    command: LogoutCommand,
    context?: CommandMetadata,
  ): Promise<Result<void>> {
    const { sessionId } = command;
    const rawRefreshToken = context.refreshToken;
    if (!rawRefreshToken) {
      return Result.fail({
        type: ErrorType.UNAUTHORIZED,
        message: 'Invalid token',
        entity: LogoutHandler.name,
      });
    }
    const session = await this.sessionRepository.findOneBySessionId(sessionId);
    if (!session)
      return Result.fail({
        type: ErrorType.UNAUTHORIZED,
        message: 'Invalid token',
        entity: LogoutHandler.name,
      });
    const isTokenValid = safeCompare(
      hashToken(rawRefreshToken),
      session.hashRefreshToken,
    );
    if (!isTokenValid) {
      session.revoked = true;
      await this.sessionRepository.save(session);
      return Result.fail({
        type: ErrorType.UNAUTHORIZED,
        message: 'Invalid token',
        entity: LogoutHandler.name,
      });
    }
    session.revoked = true;
    await this.sessionRepository.save(session);
    return Result.ok<void>(undefined);
  }
}
