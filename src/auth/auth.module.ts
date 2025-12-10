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
import { PermissionRepositoryAdapter } from '@/auth/infrastructure/persistence/permission.repository.adapter';
import { PermissionService } from '@/auth/domain/services/permission.service';
import { RefreshTokenRepositoryAdapter } from '@/auth/infrastructure/persistence/refresh-token.repository.adapter';
import { UserRepository } from '@/auth/domain/repositories/user.repository';
import { RoleRepository } from '@/auth/domain/repositories/role.repository';
import { RefreshTokenRepository } from '@/auth/domain/repositories/refresh-token.repository';
import { RefreshTokenService } from '@/auth/domain/services/refresh-token.service';
import { PermissionModel } from '@/auth/infrastructure/models/permission.model';
import { RefreshTokenModel } from '@/auth/infrastructure/models/refresh-token.model';
import { PermissionRepository } from '@/auth/domain/repositories/permission.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserModel,
      RoleModel,
      PermissionModel,
      RefreshTokenModel,
    ]),
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
    PermissionService,
    RefreshTokenService,
    {
      provide: UserRepository,
      useClass: UserRepositoryAdapter,
    },
    {
      provide: RoleRepository,
      useClass: RoleRepositoryAdapter,
    },
    {
      provide: PermissionRepository,
      useClass: PermissionRepositoryAdapter,
    },
    {
      provide: RefreshTokenRepository,
      useClass: RefreshTokenRepositoryAdapter,
    },
  ],
  exports: [TypeOrmModule, JwtStrategy, PassportModule, JwtModule],
})
export class AuthModule {}
