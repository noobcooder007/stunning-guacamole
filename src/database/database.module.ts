import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DATABASE_REPOSITORIES } from '@/database/infrastructure/persistence';
import { UnitOfWork } from '@/database/unit-of-work';
import { UserModel } from '@/auth/infrastructure/models/user.model';
import { RoleModel } from '@/auth/infrastructure/models/rol.model';
import { PermissionModel } from '@/auth/infrastructure/models/permission.model';
import { SessionModel } from '@/auth/infrastructure/models/session.model';
import { BeneficientModel } from '@/people/infrastructure/models/beneficient.model';
import { ChurchModel } from '@/people/infrastructure/models/church.model';
import { CollectorModel } from '@/people/infrastructure/models/collector.model';
import { ParticipantModel } from '@/people/infrastructure/models/participants.model';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
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
      UserModel,
      RoleModel,
      PermissionModel,
      SessionModel,
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
