import { IsUUID } from 'class-validator';

export class SessionCommand {
  @IsUUID()
  sessionId: string;
}
