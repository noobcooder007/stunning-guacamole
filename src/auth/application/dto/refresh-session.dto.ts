import { IsUUID } from 'class-validator';

export class RefreshSessionDto {
  @IsUUID()
  sessionId: string;
}
