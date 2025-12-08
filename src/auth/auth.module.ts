import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { UserModel } from '@/auth/infrastructure/models/user.model';
import { RoleModel } from '@/auth/infrastructure/models/rol.model';
import { UserRepositoryAdapter } from '@/auth/infrastructure/persistence/user.repository.adapter';
import { JwtStrategy } from '@/auth/domain/strategies/jwt.strategy';
import { AuthService } from '@/auth/domain/services/auth.service';
import { AuthController } from '@/auth/infrastructure/controllers/auth.controller';
import { UserService } from '@/auth/domain/services/user.service';
import { RoleService } from '@/auth/domain/services/role.service';
import { RoleRepositoryAdapter } from '@/auth/infrastructure/persistence/role.repository.adapter';
import { PermitModel } from '@/auth/infrastructure/models/permit.model';
import { PermitRepositoryAdapter } from '@/auth/infrastructure/persistence/permit.repository.adapter';
import { PermitService } from '@/auth/domain/services/permit.service';
import { RefreshToken } from '@/auth/infrastructure/models/refresh-token.model';
import { RefreshTokenRepositoryAdapter } from '@/auth/infrastructure/persistence/refresh-token.repository.adapter';
import { UserRepository } from './domain/repositories/user.repository';
import { RoleRepository } from './domain/repositories/role.repository';
import { PermitRepository } from './domain/repositories/permit.repository';
import { RefreshTokenRepository } from './domain/repositories/refresh-token.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserModel, RoleModel, PermitModel, RefreshToken]),
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          secret: configService.get('JWT_SECRET'),
          signOptions: {
            expiresIn: '2h',
          },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    JwtStrategy,
    AuthService,
    UserService,
    RoleService,
    PermitService,
    {
      provide: UserRepository,
      useClass: UserRepositoryAdapter,
    },
    {
      provide: RoleRepository,
      useClass: RoleRepositoryAdapter,
    },
    {
      provide: PermitRepository,
      useClass: PermitRepositoryAdapter,
    },
    {
      provide: RefreshTokenRepository,
      useClass: RefreshTokenRepositoryAdapter,
    },
  ],
  exports: [TypeOrmModule, JwtStrategy, PassportModule, JwtModule],
})
export class AuthModule {}
