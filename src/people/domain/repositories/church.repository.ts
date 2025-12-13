import { ChurchModel } from '@/people/infrastructure/models/church.model';
import { Church } from '@/people/domain/aggregate/church.aggregate';
import { Injectable } from '@nestjs/common';

@Injectable()
export abstract class ChurchRepository {
  public abstract create(church: Church): ChurchModel;
  public abstract save(church: ChurchModel): Promise<ChurchModel>;
  public abstract findById(id: string): Promise<ChurchModel>;
  public abstract findAll(
    offset: number,
    limit: number,
  ): Promise<ChurchModel[]>;
  public abstract update(id: string, church: Church): Promise<ChurchModel>;
  public abstract delete(id: string): Promise<void>;
}
