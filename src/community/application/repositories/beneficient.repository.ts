import { Injectable } from '@nestjs/common';
import { Beneficient } from '@/community/domain/aggregate/beneficient.aggregate';

@Injectable()
export abstract class IBeneficientRepository {
  abstract save(beneficient: Beneficient): Promise<Beneficient>;
  abstract exists(beneficient: Beneficient): Promise<boolean>;
  abstract findAll(offset: number, limit: number): Promise<Beneficient[] | []>;
  abstract findById(id: string): Promise<Beneficient | null>;
  abstract inIds(ids: string[]): Promise<Beneficient[] | []>;
}
