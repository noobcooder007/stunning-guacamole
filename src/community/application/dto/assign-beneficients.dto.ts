import { Transform } from 'class-transformer';
import { IsUUID, IsArray, ArrayNotEmpty } from 'class-validator';

export class AssignBeneficientsDto {
  @IsUUID()
  collectorId: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('all', { each: true })
  @Transform(({ value }) => [...new Set(value)])
  beneficientsIds: string[];
}
