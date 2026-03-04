import { Injectable } from '@nestjs/common';
import { PromiseDonation } from '@/donation/domain/aggregates/promise-donation.aggregate';

@Injectable()
export abstract class IPromiseDonationRepository {
  abstract save(promiseDonation: PromiseDonation): Promise<void>;
  abstract exists(beneficientId: string): Promise<boolean>;
  abstract findById(id: string): Promise<PromiseDonation | null>;
}
