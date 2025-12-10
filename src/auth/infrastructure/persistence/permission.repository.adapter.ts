import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PermissionRepository } from '@/auth/domain/repositories/permission.repository';
import { PermissionModel } from '@/auth/infrastructure/models/permission.model';

@Injectable()
export class PermissionRepositoryAdapter implements PermissionRepository {
  constructor(
    @InjectRepository(PermissionModel)
    private readonly permitRepository: Repository<PermissionModel>,
  ) {}

  findByRoleId(roleId: string): Promise<PermissionModel[]> {
    return this.permitRepository.find({
      where: {
        roles: {
          id: roleId,
        },
      },
    });
  }
}
