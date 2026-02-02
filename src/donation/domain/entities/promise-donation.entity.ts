import { Beneficient } from '../../../community/domain/aggregate/beneficient.aggregate';

export class PromiseDonation {
  id: string;
  startDate: Date;
  recurring: boolean;
  recurrence: number;
  promiseAmount: number;
  lastDonation: Date;
  nextDonation: Date;
  method: string;
  isActive: boolean;
  beneficient: Beneficient;
}
