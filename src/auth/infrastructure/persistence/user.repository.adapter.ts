import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { UserRepository } from '@/auth/domain/repositories/user.repository';
import { UserModel } from '@/auth/infrastructure/models/user.model';
import { BaseRepository } from '@/database/base.repository';
import { User } from '@/auth/domain/aggregates/user.aggregate';
import { UserMapper } from '../mappers/user.mapper';

@Injectable()
export class UserRepositoryAdapter
  extends BaseRepository<UserModel>
  implements UserRepository
{
  constructor(datasource: DataSource) {
    super(datasource, UserModel);
  }

  async count(): Promise<number> {
    return await this.repository.count();
  }

  async findOneById(id: string): Promise<User | null> {
    const userModel = await this.repository.findOne({
      where: {
        id,
      },
      relations: {
        participant: true,
        role: {
          permissions: true,
        },
      },
    });
    return userModel ? UserMapper.fromModelToDomain(userModel) : null;
  }

  async findOneByUsername(username: string): Promise<User | null> {
    const userModel = await this.repository.findOne({
      where: {
        username,
      },
      relations: {
        participant: true,
        role: {
          permissions: true,
        },
      },
    });
    return userModel ? UserMapper.fromModelToDomain(userModel) : null;
  }

  async save(user: User): Promise<User> {
    await this.repository.save(UserMapper.toPersistance(user));
    return user;
  }
}
