import { Permission } from '@/auth/domain/entities/permission';

export class Role {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  permissions: Permission[];

  constructor() {}

  public setId(id: string): Role {
    this.id = id;
    return this;
  }

  public setName(name: string): Role {
    this.name = name;
    return this;
  }

  public setDescription(description: string): Role {
    this.description = description;
    return this;
  }

  public setIsActive(isActive: boolean): Role {
    this.isActive = isActive;
    return this;
  }

  public setPermissions(permissions: Permission[]): Role {
    this.permissions = permissions;
    return this;
  }

  public build(): Role {
    return this;
  }
}
