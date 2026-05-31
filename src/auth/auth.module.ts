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
import { JWTService } from '@/auth/application/services/jwt.service';
import { LogoutHandler } from '@/auth/application/handlers/logout.handler';
import { SeedHandler } from '@/auth/application/handlers/seed.handler';
import { CreatePermissionHandler } from '@/auth/application/handlers/create-permission.handler';
import { UpdatePermissionHandler } from '@/auth/application/handlers/update-permission.handler';
import { DeactivatePermissionHandler } from '@/auth/application/handlers/deactivate-permission.handler';
import { AssignPermissionsToRoleHandler } from '@/auth/application/handlers/assign-permissions-to-role.handler';
import { GetAllPermissionsHandler } from '@/auth/application/handlers/get-all-permissions.handler';
import { GetAllRolesHandler } from '@/auth/application/handlers/get-all-roles.handler';
import { GetRoleByIdHandler } from '@/auth/application/handlers/get-role-by-id.handler';
import { PermissionsController } from '@/auth/infrastructure/controllers/permissions.controller';
import { RolesController } from '@/auth/infrastructure/controllers/roles.controller';

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
  controllers: [AuthController, SeedController, PermissionsController, RolesController],
  providers: [
    JwtStrategy,
    JWTService,
    CreateUserService,
    LoginUserHandler,
    SessionHandler,
    LogoutHandler,
    SeedHandler,
    CreatePermissionHandler,
    UpdatePermissionHandler,
    DeactivatePermissionHandler,
    AssignPermissionsToRoleHandler,
    GetAllPermissionsHandler,
    GetAllRolesHandler,
    GetRoleByIdHandler,
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
