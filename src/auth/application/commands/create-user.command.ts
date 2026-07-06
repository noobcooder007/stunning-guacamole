export class CreateUserCommand {
  readonly username: string;
  readonly password: string;
  readonly role: string;
  readonly gender?: string;

  constructor(
    username: string,
    password: string,
    role: string,
    gender?: string,
  ) {
    this.username = username;
    this.password = password;
    this.role = role;
    this.gender = gender;
  }
}
