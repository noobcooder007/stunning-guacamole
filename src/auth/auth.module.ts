import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { UserModel } from '@/auth/infrastructure/models/user.model';
import { RoleModel } from '@/auth/infrastructure/models/rol.model';
import { JwtStrategy } from '@/auth/domain/strategies/jwt.strategy';
import { AuthController } from '@/auth/infrastructure/controllers/auth.controller';
import { PermissionModel } from '@/auth/infrastructure/models/permission.model';
import { SessionModel } from '@/auth/infrastructure/models/session.model';
import { BcryptHasher } from '@/shared/infrastructure/security/bcrypt.hasher';
import { LoginUserHandler } from '@/auth/application/handlers/login-user.handler';
import { SessionHandler } from '@/auth/application/handlers/session.handler';
import { SeedController } from '@/auth/infrastructure/controllers/seed.controller';
import { CreateUserService } from '@/auth/infrastructure/services/create-user.service';
import { JWTService } from '@/auth/application/services/jwt.service';
import { LogoutHandler } from '@/auth/application/handlers/logout.handler';
import { SeedHandler } from '@/auth/application/handlers/seed.handler';

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([
      UserModel,
      RoleModel,
      PermissionModel,
      SessionModel,
    ]),
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          secret: configService.get('JWT_SECRET'),
        };
      },
    }),
  ],
  controllers: [AuthController, SeedController],
  providers: [
    JwtStrategy,
    JWTService,
    CreateUserService,
    LoginUserHandler,
    SessionHandler,
    LogoutHandler,
    SeedHandler,
    {
      provide: 'IPasswordHasher',
      useClass: BcryptHasher,
    },
  ],
  exports: [
    TypeOrmModule,
    JwtStrategy,
    PassportModule,
    JwtModule,
    CreateUserService,
  ],
})
export class AuthModule {}
