import { UserRepository } from '@/auth/domain/repositories/user.repository';
import { REPOSITORY_TOKENS } from '@/database/infrastructure/persistence';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SetupGuard implements CanActivate {
  constructor(
    private readonly configService: ConfigService,
    @Inject(REPOSITORY_TOKENS.USER)
    private readonly userRepository: UserRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const setupKey = request.headers['x-setup-key'];
    const masterKey = this.configService.get<string>('SETUP_KEY');

    if (!setupKey || setupKey !== masterKey) {
      throw new UnauthorizedException('Invalid setup key');
    }

    const userCount = await this.userRepository.count();
    if (userCount > 0) {
      throw new ForbiddenException('System is already initialized');
    }
    return true;
  }
}
