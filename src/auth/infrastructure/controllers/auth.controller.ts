import { Body, Controller, Post, Res } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ConfigService } from '@nestjs/config';
import { CookieOptions, Response } from 'express';
import { Result } from '@/shared/domain/dto/result.dto';
import { CommandMetadata } from '@/shared/application/dto/command-metadata.dto';
import { Auth } from '@/auth/infrastructure/decorators/auth.decorator';
import { GetContext } from '@/auth/infrastructure/decorators/get-context.decorator';
import { ValidPermitions } from '@/auth/infrastructure/decorators/permit-protected.decorator';
import { CreateUserCommand } from '@/auth/application/commands/create-user.command';
import { LoginUserCommand } from '@/auth/application/commands/login-user.command';
import { RefreshSessionCommand } from '@/auth/application/commands/refresh-session.command';
import { LogoutCommand } from '@/auth/application/commands/logout.command';
import { CreateUserDto } from '@/auth/application/dto/create-user.dto';
import { LoginUserDto } from '@/auth/application/dto/login.dto';
import { RefreshSessionDto } from '@/auth/application/dto/refresh-session.dto';
import { LogoutDto } from '@/auth/application/dto/logout.dto';

export const getCookieOptions = (
  configService: ConfigService,
): CookieOptions => ({
  httpOnly: true,
  secure: configService.get('COOKIE_SECURE') === 'true',
  sameSite:
    (configService.get('COOKIE_SAME_SITE') as 'lax' | 'strict' | 'none') ||
    'lax',
  path: '/api/auth',
});

@Controller('auth')
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly configService: ConfigService,
  ) {}

  // Establecer cookie secure: false y sameSite: 'lax' para desarrollo
  @Post('login')
  async login(
    @Body() dto: LoginUserDto,
    @GetContext() context: CommandMetadata,
    @Res({ passthrough: true }) res: Response,
  ) {
    const command = new LoginUserCommand(dto.username, dto.password);
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
      ...getCookieOptions(this.configService),
      expires: new Date(result.value.tokens.refreshExpiresIn),
    });
    return result;
  }

  @Auth(ValidPermitions.ADD_USER)
  @Post('register')
  register(@Body() dto: CreateUserDto) {
    this.commandBus.execute(
      new CreateUserCommand(dto.username, dto.password, dto.role),
    );
  }

  @Post('refresh')
  async session(
    @Body() dto: RefreshSessionDto,
    @GetContext() context: CommandMetadata,
    @Res({ passthrough: true }) res: Response,
  ) {
    const command = new RefreshSessionCommand(dto.sessionId);
    (command as any).metadata = context;
    const result = await this.commandBus.execute(command);
    if (!result.isSuccess) {
      res.clearCookie('refresh-token', {
        ...getCookieOptions(this.configService),
      });
      return Result.fail({
        type: result.error.type,
        message: result.error.message,
        entity: AuthController.name,
      });
    }
    const { refreshToken } = result.value.tokens;
    res.cookie('refresh-token', refreshToken, {
      ...getCookieOptions(this.configService),
      expires: new Date(result.value.tokens.refreshExpiresIn),
    });
    return result;
  }

  @Post('logout')
  async logout(
    @Body() dto: LogoutDto,
    @GetContext() context: CommandMetadata,
    @Res({ passthrough: true }) res: Response,
  ) {
    const command = new LogoutCommand(dto.sessionId);
    (command as any).metadata = context;
    const result = await this.commandBus.execute(command);
    res.clearCookie('session', {
      ...getCookieOptions(this.configService),
    });
    return result;
  }
}
