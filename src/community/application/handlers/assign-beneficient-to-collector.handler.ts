import { Inject } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';
import { UnitOfWork } from '@/database/unit-of-work';
import { BaseCommandHandler } from '@/shared/application/handler/base-command.handler';
import { REPOSITORY_TOKENS } from '@/database/infrastructure/persistence';
import {
  Result,
  IErrorResult,
  ErrorType,
} from '@/shared/domain/dto/result.dto';
import { ICollectorRepository } from '@/community/application/repositories/collector.repository';
import { IAssignationRepository } from '@/community/application/repositories/assignation.repository';
import { IBeneficientRepository } from '../repositories/beneficient.repository';
import { AssignBeneficientsCommand } from '@/community/application/command/assign-beneficients.command';
import {
  Beneficient,
  BeneficientId,
} from '@/community/domain/aggregate/beneficient.aggregate';
import { Assignation } from '@/community/domain/aggregate/assignation.aggregate';
import { AssignationReportResponse } from '@/community/application/dto/assignation-report.response';

@CommandHandler(AssignBeneficientsCommand)
export class AssignBeneficientToCollectorHandler extends BaseCommandHandler<
  AssignBeneficientsCommand,
  AssignationReportResponse
> {
  constructor(
    @Inject(REPOSITORY_TOKENS.COLLECTOR)
    private readonly collectorRepository: ICollectorRepository,
    @Inject(REPOSITORY_TOKENS.BENEFICIENT)
    private readonly beneficientRepository: IBeneficientRepository,
    @Inject(REPOSITORY_TOKENS.ASSIGNATION)
    private readonly assignationRepository: IAssignationRepository,
    private readonly uow: UnitOfWork,
  ) {
    super();
  }

  protected async process(
    command: AssignBeneficientsCommand,
  ): Promise<Result<AssignationReportResponse, IErrorResult>> {
    const { collectorId, beneficientsIds } = command;
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
    const candidates = beneficientsIds
      .filter((b) => !withActiveAssignationsElsewhere.has(b))
      .map((b) => {
        const previous = existingInMyCollector.find(
          (a) => a.beneficientId.unpack() === b,
        );
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
      await this.uow.runInTransaction(async () => {
        await this.assignationRepository.save([
          ...finalAssignationsToSave,
          ...finalAssignationsToReactivate,
        ]);
        await this.collectorRepository.save(collector);
      });
      this.logger.log(`[${this.traceId}] Assignations saved`);
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
}
