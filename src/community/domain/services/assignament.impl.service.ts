import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  IAssignamentService,
  IDeactivateAssignation,
} from '@/community/domain/services/assignament.service';
import { REPOSITORY_TOKENS } from '@/database/infrastructure/persistence';
import {
  Result,
  ErrorType,
  IErrorResult,
} from '@/shared/domain/dto/result.dto';
import { Assignation } from '@/community/domain/aggregate/assignation.aggregate';
import {
  Beneficient,
  BeneficientId,
} from '@/community/domain/aggregate/beneficient.aggregate';
import { IAssignationRepository } from '@/community/domain/repositories/assignation.repository';
import { IBeneficientRepository } from '@/community/domain/repositories/beneficient.repository';
import { ICollectorRepository } from '@/community/domain/repositories/collector.repository';
import { AssignationReportResponse } from '@/community/application/dto/assignation-report.response';
import { Collector } from '@/community/domain/aggregate/collector.aggregate';

@Injectable()
export class AssignamentService implements IAssignamentService {
  private readonly logger = new Logger(AssignamentService.name);

  constructor(
    @Inject(REPOSITORY_TOKENS.COLLECTOR)
    private readonly collectorRepository: ICollectorRepository,
    @Inject(REPOSITORY_TOKENS.BENEFICIENT)
    private readonly beneficientRepository: IBeneficientRepository,
    @Inject(REPOSITORY_TOKENS.ASSIGNATION)
    private readonly assignationRepository: IAssignationRepository,
  ) {}

  async createOrReactivate(
    collectorId: string,
    beneficientsIds: string[],
    { validateCollector = true }: { validateCollector?: boolean } = {},
  ): Promise<Result<AssignationReportResponse, IErrorResult>> {
    if (validateCollector) {
      const isTargetActive =
        await this.collectorRepository.isActive(collectorId);
      if (!isTargetActive) {
        return Result.fail({
          message: 'Collector not found',
          type: ErrorType.NOT_FOUND,
          entity: Collector.name,
        });
      }
    }
    const beneficientsExists =
      await this.beneficientRepository.inIds(beneficientsIds);
    if (beneficientsExists.length !== beneficientsIds.length)
      return Result.fail({
        message: 'Beneficients not found',
        type: ErrorType.NOT_FOUND,
        entity: Beneficient.name,
      });
    const [collector, existingInMyCollector, activesElsewhere] =
      await Promise.all([
        this.collectorRepository.findByIdWithAssignations(collectorId),
        this.assignationRepository.findByCollectorIdWithAssignations(
          collectorId,
          beneficientsIds,
        ),
        this.assignationRepository.findAssignationsWithElsewhere(
          collectorId,
          beneficientsIds,
        ),
      ]);
    if (activesElsewhere.length === beneficientsIds.length) {
      return Result.ok({
        addedCount: 0,
        alreadyAssignedCount: activesElsewhere.length,
        limmiteExceededCount: 0,
        addedIds: {
          created: [],
          reactivated: [],
        },
        ignoredIds: [
          ...activesElsewhere.map((a) => ({
            id: a._id.unpack(),
            reason: 'Already assigned',
          })),
        ],
      });
    }
    const withActiveAssignationsElsewhere = new Set(
      activesElsewhere.map((a) => a.beneficientId.unpack()),
    );
    const assignationsToReactivate = new Set<string>();
    const historyAssignations = new Map(
      existingInMyCollector.map((a) => [a.beneficientId.unpack(), a]),
    );
    const candidates = beneficientsIds
      .filter((b) => !withActiveAssignationsElsewhere.has(b))
      .map((b) => {
        const previous = historyAssignations.get(b);
        if (previous) {
          if (!previous.isActive) {
            assignationsToReactivate.add(previous._id.unpack());
            previous.reactivate();
          }
          return previous;
        }
        return Assignation.create({
          beneficientId: BeneficientId.of(b),
          collectorId: collector._id,
        });
      });
    const assignationsNotAdded = collector.addAssignation(
      candidates.map((a) => a._id),
    );
    const idsNotAddedSet = new Set(
      assignationsNotAdded.get('notAssigned').map((a) => a.unpack()),
    );
    const alreadyAssignedToCollector = new Set(
      assignationsNotAdded.get('alreadyAssigned').map((a) => a.unpack()),
    );
    const finalAssignationsToSave = candidates.filter(
      (a) =>
        !idsNotAddedSet.has(a._id.unpack()) &&
        !alreadyAssignedToCollector.has(a._id.unpack()) &&
        !assignationsToReactivate.has(a._id.unpack()),
    );
    const finalAssignationsToReactivate = candidates.filter((a) =>
      assignationsToReactivate.has(a._id.unpack()),
    );
    const totalChanges =
      finalAssignationsToSave.length + finalAssignationsToReactivate.length;
    if (totalChanges > 0) {
      await this.assignationRepository.save([
        ...finalAssignationsToSave,
        ...finalAssignationsToReactivate,
      ]);
      await this.collectorRepository.save(collector);
    }
    return Result.ok({
      addedCount: finalAssignationsToSave.length,
      alreadyAssignedCount: withActiveAssignationsElsewhere.size,
      limmiteExceededCount: idsNotAddedSet.size,
      addedIds: {
        created: [...finalAssignationsToSave.map((a) => a._id.unpack())],
        reactivated: [
          ...finalAssignationsToReactivate.map((a) => a._id.unpack()),
        ],
      },
      ignoredIds: [
        ...Array.from(withActiveAssignationsElsewhere).map((id) => ({
          id: id,
          reason: 'Already assigned to other collector',
        })),
        ...Array.from(alreadyAssignedToCollector).map((id) => ({
          id: id,
          reason: 'Already assigned to this collector',
        })),
        ...Array.from(idsNotAddedSet).map((id) => ({
          id: id,
          reason: 'Limit exceeded',
        })),
      ],
    });
  }

  async deactivate(
    assignationsToDesactivate: IDeactivateAssignation[],
  ): Promise<Result<void, IErrorResult>> {
    const ids = assignationsToDesactivate.map((a) => a.assignationId);
    const assignations = await this.assignationRepository.findActivesByIds(ids);
    if (assignations.length === 0)
      return Result.fail({
        message: 'Assignations not found',
        type: ErrorType.NOT_FOUND,
        entity: Assignation.name,
      });
    const assignationDeactivateReason = new Map(
      assignationsToDesactivate.map((a) => [a.assignationId, a.reason]),
    );
    assignations.forEach((a) => {
      const reason = assignationDeactivateReason.get(a._id.unpack());
      a.deactivate(reason);
    });
    await this.assignationRepository.save(assignations);
    return Result.ok();
  }
}
