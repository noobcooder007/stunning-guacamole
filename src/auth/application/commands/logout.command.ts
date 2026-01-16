import { IsUUID } from 'class-validator';

export class LogoutCommand {
  @IsUUID()
  sessionId: string;
}
