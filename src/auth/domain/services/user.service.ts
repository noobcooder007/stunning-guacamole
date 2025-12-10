import { Injectable, Inject } from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository';
import { User } from '../aggregates/user.aggregate';
import { UserModel } from '@/auth/infrastructure/models/user.model';
import { Role } from '../entities/role.entity';

@Injectable()
export class UserService {
  constructor(
    @Inject(UserRepository)
    private readonly userRepository: UserRepository,
  ) {}

  public async findByUsername(username: string): Promise<User> {
    const userModel = await this.userRepository.findOneByUsername(username);
    const role = new Role()
      .setId(userModel.role.id)
      .setName(userModel.role.name)
      .setDescription(userModel.role.description)
      .setIsActive(userModel.role.isActive)
      .build();
    return new User()
      .setId(userModel.id)
      .setUsername(userModel.username)
      .setPassword(userModel.password)
      .setIsActive(userModel.isActive)
      .setRole(role)
      .build();
  }

  public async findById(id: string): Promise<User> {
    const userModel = await this.userRepository.findOneById(id);
    const role = new Role()
      .setId(userModel.role.id)
      .setName(userModel.role.name)
      .setDescription(userModel.role.description)
      .setIsActive(userModel.role.isActive)
      .build();
    return new User()
      .setId(userModel.id)
      .setUsername(userModel.username)
      .setPassword(userModel.password)
      .setIsActive(userModel.isActive)
      .setRole(role)
      .build();
  }

  public create(user: Partial<User>): UserModel {
    return this.userRepository.create({
      username: user.username,
      password: user.password,
      role: {
        id: user.role.id,
        name: user.role.name,
      } as any,
    });
  }

  public save(user: UserModel): Promise<UserModel> {
    return this.userRepository.save(user);
  }

  public updateLastLogin(id: string): void {
    this.userRepository.updateLastLogin(id);
  }
}
