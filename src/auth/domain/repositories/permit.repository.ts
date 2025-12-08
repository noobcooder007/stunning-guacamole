import { Injectable } from '@nestjs/common';
import { PermitModel } from '@/auth/infrastructure/models/permit.model';

@Injectable()
export abstract class PermitRepository {
  abstract findByRoleId(roleId: string): Promise<PermitModel[]>;
}
