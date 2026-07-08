import { Injectable } from '@nestjs/common';
import { DataSource, FindOptionsWhere } from 'typeorm';
import { BaseRepository } from '@/database/base.repository';
import { IProfileRepository } from '@/community/domain/repositories/profile.repository';
import { ProfileSchema } from '@/community/infrastructure/persistence/typeorm/schemas/profile.schema';
import { Profile } from '@/community/domain/aggregate/profile.aggregate';
import { ProfileMapper } from '@/community/infrastructure/persistence/mappers/profile.mapper';

export interface ProfileFilters {
  id?: string;
  firstname?: string;
  firstLastname?: string;
  secondLastname?: string | null;
  addressHash?: string;
  phoneNumberHash?: string;
}

@Injectable()
export class TypeORMProfileRepository
  extends BaseRepository<ProfileSchema>
  implements IProfileRepository
{
  constructor(datasource: DataSource) {
    super(datasource, ProfileSchema);
  }

  async exists(filters: ProfileFilters): Promise<boolean> {
    if (filters.id) {
      return await this.repository.exists({ where: { id: filters.id } });
    }
    const where: FindOptionsWhere<ProfileSchema>[] = [];
    const nameMatch =
      filters.firstname && filters.firstLastname
        ? {
            firstname: filters.firstname,
            firstLastname: filters.firstLastname,
            secondLastname: filters.secondLastname ?? null,
          }
        : null;
    // Una misma dirección o teléfono no implica la misma persona (p. ej. familiares
    // en la misma casa); solo se considera duplicado si además coincide el nombre.
    if (nameMatch && filters.addressHash) {
      where.push({ ...nameMatch, addressHash: filters.addressHash });
    }
    if (nameMatch && filters.phoneNumberHash) {
      where.push({ ...nameMatch, phoneNumberHash: filters.phoneNumberHash });
    }
    if (where.length === 0 && nameMatch) {
      where.push(nameMatch);
    }
    // Un where vacío hace que TypeORM no aplique ningún WHERE y matchee
    // cualquier fila de la tabla; sin criterios no hay nada que comparar.
    if (where.length === 0) return false;
    const exists = await this.repository.exists({ where });
    return !!exists;
  }

  async findById(id: string): Promise<Profile | null> {
    const profileModel = await this.repository.findOne({ where: { id } });
    return profileModel ? ProfileMapper.toDomain(profileModel) : null;
  }

  async save(profile: Profile): Promise<void> {
    await this.repository.save(ProfileMapper.toPersistence(profile));
  }
}
