import { Role } from '@/auth/domain/entities/role.entity';
import { GeneralGuard } from '@/shared/domain/guards/general.guard';
import { Participant } from '@/people/domain/aggregate/participant.aggregate';
import { UserId } from '@/auth/domain/value-objects/user-id.vo';
import { IPasswordHasher } from '../services/password.hasher.service';

export interface UserProps {
  username: string;
  password: string;
  role: Role;
  participant?: Participant;
  isActive?: boolean;
  createdAt?: Date;
  lastLogin?: Date;
}

export class User {
  private constructor(
    private readonly id: UserId,
    private props: UserProps,
  ) {
    GeneralGuard.againstNullOrUndefined(
      props.username,
      'Username is required',
      User.name,
    );
    GeneralGuard.againstNullOrUndefined(
      props.password,
      'Password is required',
      User.name,
    );
    GeneralGuard.againstNullOrUndefined(
      props.createdAt,
      'Created at is required',
      User.name,
    );
    GeneralGuard.againstNullOrUndefined(
      props.isActive,
      'Is active is required',
      User.name,
    );
  }

  public static create(props: UserProps) {
    const id = UserId.create();
    const data = {
      ...props,
      createdAt: new Date(),
      isActive: true,
    };
    return new User(id, data);
  }

  public static recreate(id: string, props: UserProps) {
    const userId = UserId.of(id);
    return new User(userId, props);
  }

  public get _id(): string {
    return this.id.toString();
  }

  public get username(): string {
    return this.props.username;
  }

  public get password(): string {
    return this.props.password;
  }

  public get role(): Role {
    return this.props.role;
  }

  public get participant(): Participant {
    return this.props.participant;
  }

  public get isActive(): boolean {
    return this.props.isActive;
  }

  public get createdAt(): Date {
    return this.props.createdAt;
  }

  public get lastLogin(): Date {
    return this.props.lastLogin;
  }

  public async validatePassword(
    hasher: IPasswordHasher,
    rawPassword: string,
  ): Promise<boolean> {
    const isPasswordValid = await hasher.compare(rawPassword, this.password);
    return isPasswordValid && this.isActive;
  }

  public updateLastLogin() {
    this.props.lastLogin = new Date();
  }

  public desactivate() {
    this.props.isActive = false;
  }
}
