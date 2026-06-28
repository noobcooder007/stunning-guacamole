import { Type } from 'class-transformer';
import {
  IsUUID,
  IsNotEmpty,
  IsNumber,
  Min,
  IsString,
  IsDate,
  IsBoolean,
  IsOptional,
  IsArray,
  IsEnum,
} from 'class-validator';

export class WeeklySchedule {
  @IsString()
  @IsNotEmpty()
  @IsEnum([
    'Lunes',
    'Martes',
    'Miercoles',
    'Jueves',
    'Viernes',
    'Sabado',
    'Domingo',
  ])
  day: string;
  @IsString()
  @IsNotEmpty()
  hours: string;
  @IsString()
  @IsOptional()
  note?: string;
}

export class InstructionsDto {
  @IsArray({
    each: true,
  })
  @Type(() => WeeklySchedule)
  @IsNotEmpty()
  weeklySchedule: WeeklySchedule[];
  @IsString()
  @IsNotEmpty()
  generalObservations: string;
}

enum actualCurrencies {
  USD = 'USD',
  MXN = 'MXN',
}

enum actualRecurrences {
  MONTHLY = 'MONTHLY',
  BIMONTHLY = 'BIMONTHLY',
  TRIMONTHLY = 'TRIMONTHLY',
  QUARTERLY = 'QUARTERLY',
  SEMIANNUAL = 'SEMIANNUAL',
  ANNUAL = 'ANNUAL',
}

export class CreatePromiseDonationDto {
  @IsUUID()
  @IsNotEmpty()
  beneficientId: string;

  @IsNumber()
  @Min(0.01)
  @Type(() => Number)
  promiseAmount: number;

  @IsEnum(actualCurrencies)
  @IsNotEmpty()
  currency: string;

  @IsString()
  @IsNotEmpty()
  method: string;

  @IsDate()
  @Type(() => Date)
  startDate: Date;

  @IsBoolean()
  recurring: boolean;

  @IsEnum(actualRecurrences)
  @IsNotEmpty()
  recurrence: string;

  @IsOptional()
  @Type(() => InstructionsDto)
  instructions?: InstructionsDto;
}
