import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoleRepository } from '@/auth/domain/repositories/role.repository';
import { RoleModel } from '@/auth/infrastructure/models/rol.model';

@Injectable()
export class RoleRepositoryAdapter implements RoleRepository {
  constructor(
    @InjectRepository(RoleModel)
    private readonly roleRepository: Repository<RoleModel>,
  ) {}
  findById(id: string): Promise<RoleModel> {
    return this.roleRepository.findOneBy({ id: id });
  }
  create(role: Partial<RoleModel>): RoleModel {
    throw new Error('Method not implemented.');
  }
  save(role: RoleModel): Promise<RoleModel> {
    throw new Error('Method not implemented.');
  }
}
