import { Inject, Injectable } from '@nestjs/common';
import { PermissionRepository } from '@/auth/domain/repositories/permission.repository';
import { Permission } from '../entities/permission.entity';

@Injectable()
export class PermissionService {
  constructor(
    @Inject(PermissionRepository)
    private readonly permissionRepository: PermissionRepository,
  ) {}

  async findByRoleId(role: string): Promise<Permission[]> {
    const permissions = await this.permissionRepository.findByRoleId(role);
    return permissions;
  }
}
