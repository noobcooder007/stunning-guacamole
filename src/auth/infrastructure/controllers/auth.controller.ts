import { Body, Controller, Post, Req } from '@nestjs/common';
import { AuthService } from '@/auth/domain/services/auth.service';
import { LoginUserDto } from '@/auth/infrastructure/dto/login-user.dto';
import { CreateUserDto } from '@/auth/infrastructure/dto/create-user.dto';
import { PairToken } from '@/auth/infrastructure/dto/pair-token.dto';
import { RefreshTokenRequest } from '@/auth/infrastructure/dto/refresh-token.dto';
import { Auth } from '../decorators/auth.decorator';
import { AuthResponse } from '@/auth/domain/entities/auth-response.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(
    @Body() loginUserDto: LoginUserDto,
    @Req() req: Request,
  ): Promise<AuthResponse> {
    return this.authService.login(
      loginUserDto,
      req.headers['x-forwarded-for'] || (req as any).ip,
      req.headers['user-agent'],
    );
  }

  @Auth()
  @Post('register')
  register(@Body() createUserDto: CreateUserDto): void {
    this.authService.register(createUserDto);
  }

  @Post('refresh')
  refreshToken(@Body() body: RefreshTokenRequest): Promise<PairToken> {
    return this.authService.refreshToken(body);
  }
}
