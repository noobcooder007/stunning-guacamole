import { Injectable } from '@nestjs/common';
import { Collector } from '@/community/domain/aggregate/collector.aggregate';

@Injectable()
export abstract class ICollectorRepository {
  abstract exists(collector: Collector): Promise<boolean>;
  abstract findById(id: string): Promise<Collector | null>;
  abstract findByIdWithAssignations(id: string): Promise<Collector | null>;
  abstract findAll(offset: number, limit: number): Promise<Collector[]>;
  abstract save(collector: Collector): Promise<void>;
}
