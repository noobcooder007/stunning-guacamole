import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

export class DeactivateAssignationDto {
  @IsNotEmpty()
  @IsUUID()
  assignationId: string;
  @IsNotEmpty()
  @IsString()
  reason: string;
}

export class DeactivateAssignationsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DeactivateAssignationDto)
  deactivateAssignations: DeactivateAssignationDto[];
}
