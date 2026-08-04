import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { WeeklySchedule } from './create-promise-donation.dto';
import { Currency } from '@/shared/domain/enums/currency.enum';

export enum UpdateRecurrence {
  MONTHLY = 'MONTHLY',
  BIMONTHLY = 'BIMONTHLY',
  QUARTERLY = 'QUARTERLY',
  QUADRIMONTHLY = 'QUADRIMONTHLY',
  SEMIANNUAL = 'SEMIANNUAL',
  ANNUAL = 'ANNUAL',
}

export const recurrenceMap: Record<UpdateRecurrence, number> = {
  [UpdateRecurrence.MONTHLY]: 1,
  [UpdateRecurrence.BIMONTHLY]: 2,
  [UpdateRecurrence.QUARTERLY]: 3,
  [UpdateRecurrence.QUADRIMONTHLY]: 4,
  [UpdateRecurrence.SEMIANNUAL]: 6,
  [UpdateRecurrence.ANNUAL]: 12,
};

export class UpdatePromiseDonationAmountDto {
  @IsNumber()
  @Min(0.01)
  @Type(() => Number)
  promiseAmount: number;

  @IsEnum(Currency)
  @IsNotEmpty()
  currency: string;
}

export class UpdatePromiseDonationRecurrenceDto {
  @IsEnum(UpdateRecurrence)
  @IsNotEmpty()
  recurrence: string;
}

export class UpdateInstructionsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WeeklySchedule)
  weeklySchedule: WeeklySchedule[];

  @IsString()
  generalObservations: string;
}

export class UpdatePromiseDonationInstructionsDto {
  @ValidateNested()
  @Type(() => UpdateInstructionsDto)
  instructions: UpdateInstructionsDto;
}
