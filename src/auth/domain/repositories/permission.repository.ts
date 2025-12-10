import { Injectable } from '@nestjs/common';
import { PermissionModel } from '@/auth/infrastructure/models/permission.model';

@Injectable()
export abstract class PermissionRepository {
  abstract findByRoleId(roleId: string): Promise<PermissionModel[]>;
}
