import { Inject, Injectable } from '@nestjs/common';
import { RoleRepository } from '../repositories/role.repository';
import { RoleModel } from '../../infrastructure/models/rol.model';

@Injectable()
export class RoleService {
  constructor(
    @Inject(RoleRepository)
    private readonly roleRepository: RoleRepository,
  ) {}

  async findById(id: string): Promise<RoleModel> {
    return this.roleRepository.findById(id);
  }
}
