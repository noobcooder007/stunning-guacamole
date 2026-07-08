import { PromiseDonation } from '@/donation/domain/aggregates/promise-donation.aggregate';
import { BeneficientId } from '../../../../community/domain/aggregate/beneficient.aggregate';
import { UserId } from '@/auth/domain/aggregates/user.aggregate';
import { PromiseDonationSchema } from '@/donation/infrastructure/persistence/typeorm/schemas/promise-donation.schema';
import {
  PromiseDonationBeneficientResponse,
  PromiseDonationWithBeneficientsResponse,
} from '@/donation/application/dto/promise-donation-with-beneficients.response.dto';

export interface ICollectorInstructionsPersistence {
  weeklySchedule: { day: string; hours: string; note?: string }[];
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
  instructions?: ICollectorInstructionsPersistence;
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
      instructions: promiseDonation.instructions,
    };
  }

  static toDomain(
    promiseDonation: IPromiseDonationPersistence,
  ): PromiseDonation {
    return PromiseDonation.recreate(promiseDonation.id, {
      beneficientId: BeneficientId.of(promiseDonation.beneficientId),
      promiseAmount: Number(promiseDonation.promiseAmount),
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
      instructions: promiseDonation.instructions,
    });
  }

  static toResponseWithBeneficient(
    promiseDonation: PromiseDonationSchema,
  ): PromiseDonationWithBeneficientsResponse {
    const response = new PromiseDonationWithBeneficientsResponse();
    response.id = promiseDonation.id;
    const beneficientResponse = new PromiseDonationBeneficientResponse();
    beneficientResponse.id = promiseDonation.beneficient.id;
    beneficientResponse.firstname =
      promiseDonation.beneficient.profile.firstname;
    beneficientResponse.firstLastname =
      promiseDonation.beneficient.profile.firstLastname;
    beneficientResponse.secondLastname =
      promiseDonation.beneficient.profile.secondLastname;
    response.beneficient = beneficientResponse;
    response.promiseAmount = promiseDonation.promiseAmount;
    response.currency = promiseDonation.currency;
    response.method = promiseDonation.method;
    response.startDate = promiseDonation.startDate;
    response.recurring = promiseDonation.recurring;
    response.recurrence = promiseDonation.recurrence;
    response.lastDonation = promiseDonation.lastDonation;
    response.nextDonation = promiseDonation.nextDonation;
    response.isActive = promiseDonation.isActive;
    response.reasonDeactivate = promiseDonation.reasonDeactivate;
    response.createdAt = promiseDonation.createdAt;
    response.updatedAt = promiseDonation.updatedAt;
    response.instructions = promiseDonation.instructions;
    return response;
  }
}
