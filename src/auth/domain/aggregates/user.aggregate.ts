import { v4 as uuidv4 } from 'uuid';
import { Role } from '@/auth/domain/entities/role.entity';
import { GeneralGuard } from '@/shared/domain/guards/general.guard';

export class UserId {
  constructor(private readonly value: string) {
    GeneralGuard.againstNullOrUndefined(
      value,
      'Id cannot be null or undefined',
      UserId.name,
    );
  }

  public static of(): UserId {
    return new UserId(uuidv4());
  }

  public toString(): string {
    return this.value;
  }
}

export interface UserProps {
  username: string;
  password: string;
  role?: Role;
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
    const id = UserId.of();
    const data = {
      ...props,
      createdAt: new Date(),
      isActive: true,
    };
    return new User(id, data);
  }

  public static recreate(id: string, props: UserProps) {
    const userId = new UserId(id);
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

  public get isActive(): boolean {
    return this.props.isActive;
  }

  public get createdAt(): Date {
    return this.props.createdAt;
  }

  public get lastLogin(): Date {
    return this.props.lastLogin;
  }

  public assignRole(role: Role) {
    GeneralGuard.againstNullOrUndefined(
      role,
      'Role cant be null or undefined',
      User.name,
    );
    this.props.role = role;
  }

  public updateLastLogin() {
    this.props.lastLogin = new Date();
  }
}
