import { AggregateRoot } from '@nestjs/cqrs';
import { v7 as uuidv7 } from 'uuid';
import { ValueObject } from '@/shared/domain/vo/value-objet';
import { GeneralGuard } from '@/shared/domain/guards/general.guard';
import { Permission } from '@/auth/domain/entities/permission.entity';
import { DomainException } from '@/shared/domain/exceptions/domain.exception';
import { ErrorType } from '@/shared/domain/dto/result.dto';

export class RoleId extends ValueObject<string> {
  private constructor(value: string) {
    GeneralGuard.againstNullOrUndefined(
      value,
      'Id cannot be null or undefined',
      RoleId.name,
    );
    super(value);
  }

  public static create() {
    return new RoleId(uuidv7());
  }

  public static of(value: string): RoleId {
    GeneralGuard.againstValueIsUUID(value, RoleId.name);
    return new RoleId(value);
  }
}

export interface RoleProps {
  name: string;
  description: string;
  permissions: Set<Permission>;
  isActive?: boolean;
  createdAt?: Date;
}

export class Role extends AggregateRoot {
  private constructor(
    private readonly id: RoleId,
    private props: RoleProps,
  ) {
    super();
    GeneralGuard.againstNullOrUndefined(props.name, 'Name is required', 'Role');
    GeneralGuard.againstNullOrUndefined(
      props.description,
      'Description is required',
      Role.name,
    );
    GeneralGuard.againstNullOrUndefined(
      props.permissions,
      'Permissions are required',
      Role.name,
    );
    GeneralGuard.againstArrayLengthIsGreaterThan(
      props.permissions.size,
      0,
      'Permission must have at least one',
      Role.name,
    );
  }

  public static create(props: RoleProps) {
    const id = RoleId.create();
    const data = {
      ...props,
      createdAt: new Date(),
      isActive: true,
    };
    return new Role(id, data);
  }

  public static recreate(id: string, props: RoleProps) {
    const roleId = RoleId.of(id);
    return new Role(roleId, props);
  }

  public get _id(): RoleId {
    return this.id;
  }

  public get name(): string {
    return this.props.name;
  }

  public get description(): string {
    return this.props.description;
  }

  public get createdAt(): Date {
    return this.props.createdAt;
  }

  public get isActive(): boolean {
    return this.props.isActive;
  }

  public get permissions(): Permission[] {
    return Array.from(this.props.permissions);
  }

  public updatePermissions(list: Permission[]) {
    if (list.length === 0)
      throw new DomainException(
        'Permissions are required',
        'Role',
        ErrorType.VALIDATION,
      );
    this.props.permissions = new Set(list);
  }

  public desactivate() {
    this.props.isActive = false;
  }
}
