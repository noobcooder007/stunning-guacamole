import { Inject, Injectable } from '@nestjs/common';
import { RoleRepository } from '@/auth/domain/repositories/role.repository';
import { Role } from '@/auth/domain/entities/role.entity';

@Injectable()
export class RoleService {
  constructor(
    @Inject(RoleRepository)
    private readonly roleRepository: RoleRepository,
  ) {}

  async findById(id: string): Promise<Role> {
    const role = await this.roleRepository.findById(id);
    return new Role()
      .setId(role.id)
      .setName(role.name)
      .setDescription(role.description)
      .setIsActive(role.isActive)
      .build();
  }
}
