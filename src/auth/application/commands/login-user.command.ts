import { CommandMetadata } from '@/shared/application/dto/command-metadata.dto';

export class LoginUserCommand {
  readonly username: string;
  readonly password: string;
  readonly metadata?: CommandMetadata;

  constructor(username: string, password: string) {
    this.username = username;
    this.password = password;
  }
}
