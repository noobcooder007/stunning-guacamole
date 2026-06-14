import { PromiseDonation } from '@/donation/domain/aggregates/promise-donation.aggregate';
import { BeneficientId } from '../../../../community/domain/aggregate/beneficient.aggregate';
import { UserId } from '@/auth/domain/aggregates/user.aggregate';

export interface ICollectorInstructionsPersistence {
  weeklySchedule: { day: string; hours: string; note: string }[];
  generalObservations: string;
}

export interface IPromiseDonationPersistence {
  id: string;
  beneficientId: string;
  promiseAmount: number;
  currency: string;
  method: string;
  startDate: Date;
  recurring: boolean;
  recurrence: number;
  lastDonation?: Date;
  nextDonation?: Date;
  isActive: boolean;
  reasonDeactivate?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  collectorInstructions?: ICollectorInstructionsPersistence;
}

export class PromiseDonationMapper {
  static toPersistence(
    promiseDonation: PromiseDonation,
  ): IPromiseDonationPersistence {
    return {
      id: promiseDonation._id.unpack(),
      beneficientId: promiseDonation.beneficientId.unpack(),
      promiseAmount: promiseDonation.promiseAmount,
      currency: promiseDonation.currency,
      method: promiseDonation.method,
      startDate: promiseDonation.startDate,
      recurring: promiseDonation.recurring,
      recurrence: promiseDonation.recurrence,
      lastDonation: promiseDonation.lastDonation,
      nextDonation: promiseDonation.nextDonation,
      isActive: promiseDonation.isActive,
      reasonDeactivate: promiseDonation.reasonDeactivate,
      createdBy: promiseDonation.createdBy.unpack(),
      createdAt: promiseDonation.createdAt,
      updatedAt: promiseDonation.updatedAt,
      collectorInstructions: promiseDonation.collectorInstructions,
    };
  }

  static toDomain(
    promiseDonation: IPromiseDonationPersistence,
  ): PromiseDonation {
    return PromiseDonation.recreate(promiseDonation.id, {
      beneficientId: BeneficientId.of(promiseDonation.beneficientId),
      promiseAmount: promiseDonation.promiseAmount,
      currency: promiseDonation.currency,
      method: promiseDonation.method,
      startDate: promiseDonation.startDate,
      recurring: promiseDonation.recurring,
      recurrence: promiseDonation.recurrence,
      isActive: promiseDonation.isActive,
      reasonDeactivate: promiseDonation.reasonDeactivate,
      createdBy: UserId.of(promiseDonation.createdBy),
      createdAt: promiseDonation.createdAt,
      updatedAt: promiseDonation.updatedAt,
      lastDonation: promiseDonation.lastDonation,
      nextDonation: promiseDonation.nextDonation,
      collectorInstructions: promiseDonation.collectorInstructions,
    });
  }
}
