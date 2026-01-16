import { v4 as uuidv4 } from 'uuid';
import { Permission } from '@/auth/domain/entities/permission.entity';
import { GeneralGuard } from '@/shared/domain/guards/general.guard';

export class RoleId {
  constructor(private readonly value: string) {
    GeneralGuard.againstNullOrUndefined(
      value,
      'Id cannot be null or undefined',
      RoleId.name,
    );
  }

  public static of(): RoleId {
    return new RoleId(uuidv4());
  }

  public toString(): string {
    return this.value;
  }
}

export interface RoleProps {
  name: string;
  description: string;
  permissions: Permission[];
  isActive?: boolean;
  createdAt?: Date;
}

export class Role {
  constructor(
    private readonly id: RoleId,
    private props: RoleProps,
  ) {
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
      props.permissions.length,
      0,
      'Permission must have at least one',
      Role.name,
    );
  }

  public static create(props: RoleProps) {
    const id = RoleId.of();
    const data = {
      ...props,
      createdAt: new Date(),
      isActive: true,
    };
    return new Role(id, data);
  }

  public static recreate(id: string, props: RoleProps) {
    const roleId = new RoleId(id);
    return new Role(roleId, props);
  }

  public get _id(): string {
    return this.id.toString();
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
    return this.props.permissions;
  }
}
