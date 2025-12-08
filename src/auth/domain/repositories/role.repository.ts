import { RoleModel } from '@/auth/infrastructure/models/rol.model';
import { Injectable } from '@nestjs/common';

@Injectable()
export abstract class RoleRepository {
  abstract findById(id: string): Promise<RoleModel>;
  abstract create(role: Partial<RoleModel>): RoleModel;
  abstract save(role: RoleModel): Promise<RoleModel>;
}
