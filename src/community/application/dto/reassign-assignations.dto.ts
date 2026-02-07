import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

export class ReassignAssignationDto {
  @IsNotEmpty()
  @IsUUID()
  assignationId: string;
  @IsNotEmpty()
  @IsString()
  reason: string;
}

export class ReassignAssignationsDto {
  @IsNotEmpty()
  @IsUUID()
  collectorId: string;
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReassignAssignationDto)
  reassignAssignations: ReassignAssignationDto[];
}
