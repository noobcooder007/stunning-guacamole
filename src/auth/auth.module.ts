import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { SharedModule } from '@/shared/shared.module';
import { UserSchema } from '@/auth/infrastructure/persistence/typeorm/schemas/user.schema';
import { RoleSchema } from '@/auth/infrastructure/persistence/typeorm/schemas/role.schema';
import { JwtStrategy } from '@/auth/domain/strategies/jwt.strategy';
import { AuthController } from '@/auth/infrastructure/controllers/auth.controller';
import { PermissionSchema } from '@/auth/infrastructure/persistence/typeorm/schemas/permission.schema';
import { SessionSchema } from '@/auth/infrastructure/persistence/typeorm/schemas/session.schema';
import { LoginUserHandler } from '@/auth/application/handlers/login-user.handler';
import { SessionHandler } from '@/auth/application/handlers/session.handler';
import { SeedController } from '@/auth/infrastructure/controllers/seed.controller';
import { CreateUserService } from '@/auth/infrastructure/services/create-user.service';
import { CreateUserAdminService } from '@/auth/infrastructure/services/create-user-admin.service';
import { CreateUserCollectorService } from '@/auth/infrastructure/services/create-user-collector.service';
import { JWTService } from '@/auth/application/services/jwt.service';
import { LogoutHandler } from '@/auth/application/handlers/logout.handler';
import { SeedHandler } from '@/auth/application/handlers/seed.handler';

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([
      UserSchema,
      RoleSchema,
      PermissionSchema,
      SessionSchema,
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
    SharedModule,
  ],
  controllers: [AuthController, SeedController],
  providers: [
    JwtStrategy,
    JWTService,
    CreateUserService,
    CreateUserAdminService,
    CreateUserCollectorService,
    LoginUserHandler,
    SessionHandler,
    LogoutHandler,
    SeedHandler,
  ],
  exports: [
    TypeOrmModule,
    JwtStrategy,
    PassportModule,
    JwtModule,
    CreateUserService,
    CreateUserAdminService,
    CreateUserCollectorService,
  ],
})
export class AuthModule {}
