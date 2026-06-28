import { ICollectorInstructions } from '@/donation/domain/aggregates/promise-donation.aggregate';

export class UpdatePromiseDonationAmountCommand {
  constructor(
    public readonly id: string,
    public readonly promiseAmount: number,
    public readonly currency: string,
  ) {}
}

export class UpdatePromiseDonationRecurrenceCommand {
  constructor(
    public readonly id: string,
    public readonly recurrence: number,
  ) {}
}

export class UpdatePromiseDonationInstructionsCommand {
  constructor(
    public readonly id: string,
    public readonly instructions: ICollectorInstructions,
  ) {}
}
