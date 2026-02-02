export class CreateUserCommand {
  readonly username: string;
  readonly password: string;
  readonly role: string;

  constructor(username: string, password: string, role: string) {
    this.username = username;
    this.password = password;
    this.role = role;
  }
}
