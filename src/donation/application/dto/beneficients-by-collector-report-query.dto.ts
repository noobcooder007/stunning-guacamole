import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  Max,
  Min,
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

// Acota el rango a 36 meses para evitar que un filtro sin collectorNumber
// cargue en memoria (JSON y PDF) el histórico completo de recibos pagados.
export const MAX_REPORT_RANGE_MONTHS = 36;

@ValidatorConstraint({ name: 'isPeriodRangeValid', async: false })
class PeriodRangeConstraint implements ValidatorConstraintInterface {
  validate(_: any, args: ValidationArguments) {
    const dto = args.object as BeneficientsByCollectorReportQueryDto;
    if (
      dto.fromMonth == null ||
      dto.fromYear == null ||
      dto.toMonth == null ||
      dto.toYear == null
    ) {
      return true;
    }
    const fromKey = dto.fromYear * 12 + dto.fromMonth;
    const toKey = dto.toYear * 12 + dto.toMonth;
    if (toKey < fromKey) return false;
    return toKey - fromKey < MAX_REPORT_RANGE_MONTHS;
  }

  defaultMessage(args: ValidationArguments) {
    const dto = args.object as BeneficientsByCollectorReportQueryDto;
    const fromKey = dto.fromYear * 12 + dto.fromMonth;
    const toKey = dto.toYear * 12 + dto.toMonth;
    if (toKey < fromKey) {
      return 'toMonth/toYear must not be before fromMonth/fromYear.';
    }
    return `The period range must not exceed ${MAX_REPORT_RANGE_MONTHS} months.`;
  }
}

function IsValidPeriodRange(validationOptions?: ValidationOptions) {
  return function (object: new (...args: any[]) => object) {
    registerDecorator({
      target: object,
      propertyName: 'periodRangeCheck',
      options: validationOptions,
      constraints: [],
      validator: PeriodRangeConstraint,
    });
  };
}

@IsValidPeriodRange()
export class BeneficientsByCollectorReportQueryDto {
  @IsInt()
  @Min(1)
  @Max(12)
  @Transform(({ value }) => Number(value))
  fromMonth: number;

  @IsInt()
  @Min(2000)
  @Transform(({ value }) => Number(value))
  fromYear: number;

  @IsInt()
  @Min(1)
  @Max(12)
  @Transform(({ value }) => Number(value))
  toMonth: number;

  @IsInt()
  @Min(2000)
  @Transform(({ value }) => Number(value))
  toYear: number;

  @IsOptional()
  @Transform(({ obj, key }) => {
    const value = obj[key];
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  includeSpecial?: boolean;

  @IsOptional()
  @IsInt()
  @Transform(({ value }) =>
    value === undefined || value === '' ? undefined : Number(value),
  )
  collectorNumber?: number;
}
