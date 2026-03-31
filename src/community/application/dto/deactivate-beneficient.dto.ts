import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class DeactivateBeneficientDto {
  @IsNotEmpty()
  @IsUUID()
  beneficientId: string;

  @IsNotEmpty()
  @IsString()
  reason: string;
}
