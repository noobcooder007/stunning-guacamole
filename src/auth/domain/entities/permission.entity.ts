import { v4 as uuidv4 } from 'uuid';
import { GeneralGuard } from '@/shared/domain/guards/general.guard';
import { ValueObject } from '@/shared/domain/vo/value-objet';

export class PermissionId extends ValueObject<string> {
  private constructor(value: string) {
    GeneralGuard.againstNullOrUndefined(
      value,
      'Id cannot be null or undefined',
      PermissionId.name,
    );
    super(value);
  }

  public static create() {
    return new PermissionId(uuidv4());
  }

  public static of(value: string): PermissionId {
    GeneralGuard.againstValueIsUUID(value, PermissionId.name);
    return new PermissionId(value);
  }

  public toString(): string {
    return this.value;
  }
}

export interface PermissionProps {
  name: string;
  description: string;
  createdAt?: Date;
  isActive?: boolean;
}

export class Permission {
  constructor(
    private readonly id: PermissionId,
    private props: PermissionProps,
  ) {
    GeneralGuard.againstNullOrUndefined(
      props.name,
      'Name is required',
      Permission.name,
    );
    GeneralGuard.againstNullOrUndefined(
      props.description,
      'Description is required',
      Permission.name,
    );
  }

  public static create(props: PermissionProps) {
    const id = PermissionId.create();
    const data: PermissionProps = {
      ...props,
      createdAt: new Date(),
      isActive: true,
    };
    return new Permission(id, data);
  }

  public static recreate(id: string, props: PermissionProps) {
    const permissionId = PermissionId.of(id);
    return new Permission(permissionId, props);
  }

  public get _id(): PermissionId {
    return this.id;
  }

  public get name(): string {
    return this.props.name;
  }

  public get description(): string {
    return this.props.description;
  }

  public get isActive(): boolean {
    return this.props.isActive;
  }

  public get createdAt(): Date {
    return this.props.createdAt;
  }
}
