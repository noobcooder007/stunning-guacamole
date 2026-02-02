import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BaseRepository } from '@/database/base.repository';
import { IChurchRepository } from '@/community/domain/repositories/church.repository';
import { ChurchSchema } from '@/community/infrastructure/persistence/typeorm/schemas/church.schema';
import { Church } from '@/community/domain/aggregate/church.aggregate';
import { ChurchMapper } from '@/community/infrastructure/persistence/mappers/church.mapper';

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

  public async exists(church: Church): Promise<boolean> {
    const churchModel = await this.repository.findOne({
      where: [
        {
          vicaria: church.ecclesialIdentity.vicaria,
          decanato: church.ecclesialIdentity.decanato,
          parroquia: church.ecclesialIdentity.parroquia,
          capilla: church.ecclesialIdentity.capilla,
        },
        {
          street: church.address.street,
          noExt: church.address.numeration.noExt,
          city: church.address.city,
          state: church.address.state,
          zipCode: church.address.zipCode.value,
        },
      ],
    });
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
