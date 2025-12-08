import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PermitRepository } from '@/auth/domain/repositories/permit.repository';
import { PermitModel } from '@/auth/infrastructure/models/permit.model';

@Injectable()
export class PermitRepositoryAdapter implements PermitRepository {
  constructor(
    @InjectRepository(PermitModel)
    private readonly permitRepository: Repository<PermitModel>,
  ) {}

  findByRoleId(roleId: string): Promise<PermitModel[]> {
    return this.permitRepository.find({
      where: {
        roles: {
          id: roleId,
        },
      },
    });
  }
}
