import { Injectable } from '@nestjs/common';
import { Role } from '@/auth/domain/aggregates/role.aggregate';

@Injectable()
export abstract class IRoleRepository {
  abstract findAll(): Promise<Role[]>;
  abstract findById(id: string): Promise<Role>;
  abstract findByName(name: string): Promise<Role | null>;
  abstract save(roles: Role | Role[]): Promise<Role | Role[]>;
}
