import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DATABASE_REPOSITORIES } from '@/database/infrastructure/persistence';
import { UnitOfWork } from '@/database/unit-of-work';
import { UserSchema } from '@/auth/infrastructure/persistence/typeorm/schemas/user.schema';
import { RoleSchema } from '@/auth/infrastructure/persistence/typeorm/schemas/role.schema';
import { PermissionSchema } from '@/auth/infrastructure/persistence/typeorm/schemas/permission.schema';
import { SessionSchema } from '@/auth/infrastructure/persistence/typeorm/schemas/session.schema';
import { BeneficientModel } from '@/people/infrastructure/models/beneficient.model';
import { ChurchModel } from '@/people/infrastructure/models/church.model';
import { CollectorModel } from '@/people/infrastructure/models/collector.model';
import { ParticipantModel } from '@/people/infrastructure/models/participants.model';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),
    TypeOrmModule.forFeature([
      UserSchema,
      RoleSchema,
      PermissionSchema,
      SessionSchema,
      BeneficientModel,
      ChurchModel,
      BeneficientModel,
      CollectorModel,
      ParticipantModel,
    ]),
  ],
  providers: [UnitOfWork, ...DATABASE_REPOSITORIES],
  exports: [
    TypeOrmModule,
    UnitOfWork,
    ...DATABASE_REPOSITORIES.map((r) => r.provide),
  ],
})
export class DatabaseModule {}
