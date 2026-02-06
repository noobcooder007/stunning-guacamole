import { Injectable } from '@nestjs/common';
import { DataSource, FindOptionsWhere } from 'typeorm';
import { BaseRepository } from '@/database/base.repository';
import { IChurchRepository } from '@/community/domain/repositories/church.repository';
import { ChurchSchema } from '@/community/infrastructure/persistence/typeorm/schemas/church.schema';
import { Church } from '@/community/domain/aggregate/church.aggregate';
import { ChurchMapper } from '@/community/infrastructure/persistence/mappers/church.mapper';

export interface ChurchFilter {
  vicaria?: string;
  decanato?: string;
  parroquia?: string;
  capilla?: string;
  street?: string;
  noExt?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

@Injectable()
export class TypeORMChurchRepository
  extends BaseRepository<ChurchSchema>
  implements IChurchRepository
{
  constructor(datasource: DataSource) {
    super(datasource, ChurchSchema);
  }

  public async save(church: Church): Promise<Church> {
    const churchModel = ChurchMapper.toPersistence(church);
    const churchSaved = await this.repository.save(churchModel);
    return ChurchMapper.toDomain(churchSaved);
  }

  public async exists(filter: ChurchFilter): Promise<boolean> {
    const where: FindOptionsWhere<ChurchSchema>[] = [];
    if (
      filter.vicaria &&
      filter.decanato &&
      filter.parroquia &&
      filter.capilla
    ) {
      where.push({
        vicaria: filter.vicaria,
        decanato: filter.decanato,
        parroquia: filter.parroquia,
        capilla: filter.capilla,
      });
    }
    if (
      filter.street &&
      filter.noExt &&
      filter.city &&
      filter.state &&
      filter.zipCode
    ) {
      where.push({
        street: filter.street,
        noExt: filter.noExt,
        city: filter.city,
        state: filter.state,
        zipCode: filter.zipCode,
      });
    }

    const churchModel = await this.repository.exists({ where });
    return !!churchModel;
  }

  public async findById(id: string): Promise<Church | null> {
    const churchModel = await this.repository.findOne({ where: { id } });
    if (!churchModel) return null;
    return ChurchMapper.toDomain(churchModel);
  }

  public async findAll(
    offset: number = 0,
    limit: number = 10,
  ): Promise<Church[]> {
    const churchesModelList = await this.repository.find({
      skip: offset,
      take: limit,
    });
    return churchesModelList.map((churchModel) => {
      return ChurchMapper.toDomain(churchModel);
    });
  }

  public delete(id: string): void {
    this.repository.update(id, { isActive: false });
  }
}
