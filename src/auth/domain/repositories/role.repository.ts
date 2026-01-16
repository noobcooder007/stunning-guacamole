import { Injectable } from '@nestjs/common';
import { Role } from '../entities/role.entity';

@Injectable()
export abstract class RoleRepository {
  abstract findById(id: string): Promise<Role>;
  abstract findByName(name: string): Promise<Role | null>;
  abstract save(roles: Role | Role[]): Promise<Role | Role[]>;
}
