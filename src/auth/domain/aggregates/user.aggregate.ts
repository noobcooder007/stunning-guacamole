import { AggregateRoot } from '@nestjs/cqrs';
import { v7 as uuidv7 } from 'uuid';
import { GeneralGuard } from '@/shared/domain/guards/general.guard';
import { ValueObject } from '@/shared/domain/vo/value-objet';
import { IPasswordHasher } from '@/auth/domain/services/password.hasher.service';
import { RoleId } from '@/auth/domain/aggregates/role.aggregate';

export class UserId extends ValueObject<string> {
  private constructor(value: string) {
    GeneralGuard.againstNullOrUndefined(
      value,
      'Id cannot be null or undefined',
      UserId.name,
    );
    super(value);
  }

  public static create(): UserId {
    return new UserId(uuidv7());
  }

  public static of(value: string): UserId {
    GeneralGuard.againstValueIsUUID(value, UserId.name);
    return new UserId(value);
  }
}

export interface UserProps {
  username: string;
  password: string;
  roleId: RoleId;
  isActive?: boolean;
  createdAt?: Date;
  lastLogin?: Date;
}

export class User extends AggregateRoot {
  private constructor(
    private readonly id: UserId,
    private props: UserProps,
  ) {
    super();
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
      props.roleId,
      'Role id is required',
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

  public get _id(): UserId {
    return this.id;
  }

  public get username(): string {
    return this.props.username;
  }

  public get password(): string {
    return this.props.password;
  }

  public get role(): RoleId {
    return this.props.roleId;
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
