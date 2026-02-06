import { Injectable } from '@nestjs/common';
import { Church } from '@/community/domain/aggregate/church.aggregate';
import { ChurchFilter } from '@/community/infrastructure/persistence/typeorm/adapters/typeorm-church.repository';

@Injectable()
export abstract class IChurchRepository {
  public abstract save(church: Church): Promise<Church>;
  public abstract exists(church: ChurchFilter): Promise<boolean>;
  public abstract findById(id: string): Promise<Church | null>;
  public abstract findAll(offset: number, limit: number): Promise<Church[]>;
  public abstract delete(id: string): void;
}
