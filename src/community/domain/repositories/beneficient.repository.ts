import { Injectable } from '@nestjs/common';
import { Beneficient } from '@/community/domain/aggregate/beneficient.aggregate';
import { BeneficientFilters } from '@/community/infrastructure/persistence/typeorm/adapters/typeorm-beneficient.repository';

@Injectable()
export abstract class IBeneficientRepository {
  abstract save(beneficient: Beneficient): Promise<Beneficient>;
  abstract exists(beneficient: BeneficientFilters): Promise<boolean>;
  abstract findAll(offset: number, limit: number): Promise<Beneficient[] | []>;
  abstract findById(id: string): Promise<Beneficient | null>;
  abstract findByUserId(userId: string): Promise<Beneficient | null>;
  abstract inIds(ids: string[]): Promise<Beneficient[] | []>;
}
