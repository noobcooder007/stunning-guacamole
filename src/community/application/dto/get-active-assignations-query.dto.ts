import { IsNotEmpty, IsUUID } from 'class-validator';

export class GetActiveAssignationsQueryDto {
  @IsNotEmpty()
  @IsUUID()
  collectorId: string;
}
