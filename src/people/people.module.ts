import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChurchService } from '@/people/domain/services/church.service';
import { ChurchController } from '@/people/infrastructure/controllers/church.controller';
import { ChurchModel } from '@/people/infrastructure/models/church.model';
import { ChurchRepository } from './domain/repositories/church.repository';
import { ChurchRepositoryAdapater } from './infrastructure/persistence/church.repository.adapter';
import { AuthModule } from '@/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([ChurchModel]), AuthModule],
  controllers: [ChurchController],
  providers: [
    ChurchService,
    { provide: ChurchRepository, useClass: ChurchRepositoryAdapater },
  ],
})
export class PeopleModule {}
