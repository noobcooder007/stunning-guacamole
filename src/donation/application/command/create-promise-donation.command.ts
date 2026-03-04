import { CreatePromiseDonationDto } from '@/donation/application/dto/create-promise-donation.dto';

enum RecurrenceType {
  MONTHLY = 'MONTHLY',
  BIMONTHLY = 'BIMONTHLY',
  QUARTERLY = 'QUARTERLY',
  QUADRIMONTHLY = 'QUADRIMONTHLY',
  SEMIANNUAL = 'SEMIANNUAL',
  ANNUAL = 'ANNUAL',
}

const recurrenceMap: Record<RecurrenceType, { value: number; unit: 'month' }> =
  {
    [RecurrenceType.MONTHLY]: { value: 1, unit: 'month' },
    [RecurrenceType.BIMONTHLY]: { value: 2, unit: 'month' },
    [RecurrenceType.QUARTERLY]: { value: 3, unit: 'month' },
    [RecurrenceType.QUADRIMONTHLY]: { value: 4, unit: 'month' },
    [RecurrenceType.SEMIANNUAL]: { value: 6, unit: 'month' },
    [RecurrenceType.ANNUAL]: { value: 12, unit: 'month' },
  };

export class CreatePromiseDonationCommand {
  constructor(
    public readonly beneficientId: string,
    public readonly promiseAmount: number,
    public readonly currency: string,
    public readonly method: string,
    public readonly startDate: Date,
    public readonly recurring: boolean,
    public readonly recurrence: number,
    public readonly createdBy: string,
  ) {}

  static fromDto(
    dto: CreatePromiseDonationDto,
    createdBy: string,
  ): CreatePromiseDonationCommand {
    const config = recurrenceMap[dto.recurrence as RecurrenceType];
    return new CreatePromiseDonationCommand(
      dto.beneficientId,
      dto.promiseAmount,
      dto.currency,
      dto.method,
      dto.startDate,
      dto.recurring,
      config.value,
      createdBy,
    );
  }
}
