import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class sessionRequest {
  @IsString()
  @IsNotEmpty()
  session: string;
  @IsUUID()
  @IsNotEmpty()
  sessionId: string;
}
