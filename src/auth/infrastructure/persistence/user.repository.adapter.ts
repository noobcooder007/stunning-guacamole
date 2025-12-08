import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRepository } from '@/auth/domain/repositories/user.repository';
import { UserModel } from '@/auth/infrastructure/models/user.model';

@Injectable()
export class UserRepositoryAdapter implements UserRepository {
  constructor(
    @InjectRepository(UserModel)
    private readonly userRepository: Repository<UserModel>,
  ) {}

  findOneById(id: string): Promise<UserModel> {
    return this.userRepository.findOne({
      where: {
        id,
      },
      relations: {
        role: true,
      },
    });
  }

  findOneByUsername(username: string): Promise<UserModel | null> {
    return this.userRepository.findOne({
      where: {
        username,
      },
      select: {
        id: true,
        username: true,
        password: true,
        isActive: true,
      },
      relations: {
        role: true,
      },
    });
  }

  create(user: Partial<UserModel>): UserModel {
    return this.userRepository.create(user);
  }

  save(user: UserModel): Promise<UserModel> {
    return this.userRepository.save(user);
  }

  updateLastLogin(id: string): void {
    this.userRepository.update(id, {
      lastLogin: new Date(),
    });
  }
}
