import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

export class DesactivateAssignationDto {
  @IsNotEmpty()
  @IsUUID()
  assignationId: string;
  @IsNotEmpty()
  @IsString()
  reason: string;
}

export class DesactivateAssignationsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DesactivateAssignationDto)
  desactivateAssignations: DesactivateAssignationDto[];
}
