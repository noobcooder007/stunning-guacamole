import { Role } from '@/auth/domain/entities/role.entity';
import { Permission } from '@/auth/domain/entities/permission.entity';

export class User {
  id: string;
  username: string;
  password?: string;
  role: Role;
  isActive: boolean;
  lastLogin?: Date;

  constructor() {}

  public setId(id: string): User {
    this.id = id;
    return this;
  }

  public setUsername(username: string): User {
    this.username = username;
    return this;
  }

  public setPassword(password: string): User {
    this.password = password;
    return this;
  }

  public setRole(role: Role): User {
    this.role = role;
    return this;
  }

  public setIsActive(isActive: boolean): User {
    this.isActive = isActive;
    return this;
  }

  public setLastLogin(lastLogin: Date): User {
    this.lastLogin = lastLogin;
    return this;
  }

  public build(): User {
    return this;
  }

  public addPermissions(permissions: Permission[]): User {
    this.role.setPermissions(permissions);
    return this;
  }
}
