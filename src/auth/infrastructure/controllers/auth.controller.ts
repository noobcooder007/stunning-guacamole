import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from 'src/auth/domain/services/auth.service';
import { LoginUserDto } from '../dto/login-user.dto';
import { CreateUserDto } from '../dto/create-user.dto';
import { PairToken } from '../dto/pair-token.dto';
import { RefreshTokenRequest } from '../dto/refresh-token.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() loginUserDto: LoginUserDto): Promise<PairToken> {
    return this.authService.login(loginUserDto);
  }

  @Post('register')
  register(@Body() createUserDto: CreateUserDto): void {
    this.authService.register(createUserDto);
  }

  @Post('refresh')
  refreshToken(@Body() body: RefreshTokenRequest): Promise<PairToken> {
    return this.authService.refreshToken(body.refreshToken);
  }
}
