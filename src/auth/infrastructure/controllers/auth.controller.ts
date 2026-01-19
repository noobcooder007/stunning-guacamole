import { Body, Controller, Post, Res } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { Response } from 'express';
import { Auth } from '@/auth/infrastructure/decorators/auth.decorator';
import { CommandMetadata } from '@/shared/application/dto/command-metadata.dto';
import { CreateUserCommand } from '@/auth/application/commands/create-user.command';
import { GetContext } from '@/auth/infrastructure/decorators/get-context.decorator';
import { LoginUserCommand } from '@/auth/application/commands/login-user.command';
import { ValidPermitions } from '@/auth/infrastructure/decorators/permit-protected.decorator';
import { SessionCommand } from '@/auth/application/commands/session.command';
import { LogoutCommand } from '@/auth/application/commands/logout.command';
import { Result } from '@/shared/domain/dto/result.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly commandBus: CommandBus) {}

  // Establecer cookie secure: false y sameSite: 'lax' para desarrollo
  @Post('login')
  async login(
    @Body() command: LoginUserCommand,
    @GetContext() context: CommandMetadata,
    @Res({ passthrough: true }) res: Response,
  ) {
    (command as any).metadata = context;
    const result = await this.commandBus.execute(command);
    if (!result.isSuccess)
      return Result.fail({
        type: result.error.type,
        message: result.error.message,
        entity: AuthController.name,
      });
    const { refreshToken } = result.value.tokens;
    res.cookie('refresh-token', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      expires: new Date(result.value.tokens.refreshExpiresIn),
      // maxAge: 30 * 24 * 60 * 60 * 1000,
      path: '/api/auth',
    });
    return result;
  }

  @Auth(ValidPermitions.ADD_USER)
  @Post('register')
  register(@Body() command: CreateUserCommand) {
    this.commandBus.execute(command);
  }

  @Post('refresh')
  async session(
    @Body() command: SessionCommand,
    @GetContext() context: CommandMetadata,
    @Res({ passthrough: true }) res: Response,
  ) {
    (command as any).metadata = context;
    const result = await this.commandBus.execute(command);
    if (!result.isSuccess) {
      res.clearCookie('refresh-token', {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        path: '/api/auth',
      });
      return Result.fail({
        type: result.error.type,
        message: result.error.message,
        entity: AuthController.name,
      });
    }
    const { refreshToken } = result.value.tokens;
    res.cookie('refresh-token', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      expires: new Date(result.value.tokens.refreshExpiresIn),
      // maxAge: 30 * 24 * 60 * 60 * 1000,
      path: '/api/auth',
    });
    return result;
  }

  @Post('logout')
  async logout(
    @Body() command: LogoutCommand,
    @GetContext() context: CommandMetadata,
    @Res({ passthrough: true }) res: Response,
  ) {
    (command as any).metadata = context;
    const result = await this.commandBus.execute(command);
    res.clearCookie('session', {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/api/auth',
    });
    return result;
  }
}
