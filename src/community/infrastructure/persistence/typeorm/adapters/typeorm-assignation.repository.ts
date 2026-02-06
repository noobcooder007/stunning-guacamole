import { Injectable } from '@nestjs/common';
import { DataSource, In, Not } from 'typeorm';
import { BaseRepository } from '@/database/base.repository';
import { AssignationSchema } from '@/community/infrastructure/persistence/typeorm/schemas/assignation.schema';
import { IAssignationRepository } from '@/community/domain/repositories/assignation.repository';
import { Assignation } from '@/community/domain/aggregate/assignation.aggregate';
import { AssignationMapper } from '@/community/infrastructure/persistence/mappers/assignation.mapper';

@Injectable()
export class TypeORMAssignationRepository
  extends BaseRepository<AssignationSchema>
  implements IAssignationRepository
{
  constructor(datasource: DataSource) {
    super(datasource, AssignationSchema);
  }

  save(assignation: Assignation): Promise<void>;
  save(assignations: Assignation[]): Promise<void>;
  async save(assignations: Assignation | Assignation[]): Promise<void> {
    if (Array.isArray(assignations)) {
      const assignationEntities = assignations.map((assignation) =>
        AssignationMapper.toPersistence(assignation),
      );
      await this.repository.save(assignationEntities);
      return;
    }
    await this.repository.save(
      AssignationMapper.toPersistence(assignations as Assignation),
    );
  }

  async findActiveByCollectorIdAndBeneficientIds(
    collectorId: string,
    ids: string[],
  ): Promise<Assignation[]> {
    const assignations = await this.repository.find({
      where: {
        collectorId: collectorId,
        beneficientId: In(ids),
        isActive: true,
      },
    });
    if (!assignations) {
      return [];
    }
    return assignations.map((a) => AssignationMapper.toDomain(a));
  }

  async findByCollectorIdWithAssignations(
    collectorId: string,
    beneficientsIds: string[],
  ): Promise<Assignation[]> {
    const assignations = await this.repository.find({
      where: {
        collectorId: collectorId,
        beneficientId: In(beneficientsIds),
      },
    });
    if (!assignations) {
      return [];
    }
    return assignations.map((a) => AssignationMapper.toDomain(a));
  }

  async findAssignationsWithElsewhere(
    collectorId: string,
    beneficientIds: string[],
  ): Promise<Assignation[]> {
    const assignations = await this.repository.find({
      where: {
        collectorId: Not(collectorId),
        beneficientId: In(beneficientIds),
        isActive: true,
      },
    });
    if (!assignations) {
      return [];
    }
    return assignations.map((a) => AssignationMapper.toDomain(a));
  }

  async findActivesByIds(beneficientsIds: string[]): Promise<Assignation[]> {
    const assignations = await this.repository.find({
      where: {
        id: In(beneficientsIds),
        isActive: true,
      },
    });
    if (!assignations) {
      return [];
    }
    return assignations.map((a) => AssignationMapper.toDomain(a));
  }

  async findActivesByCollectorId(collectorId: string): Promise<Assignation[]> {
    const assignations = await this.repository.find({
      where: {
        collectorId: collectorId,
        isActive: true,
      },
    });
    if (!assignations) {
      return [];
    }
    return assignations.map((a) => AssignationMapper.toDomain(a));
  }
}
