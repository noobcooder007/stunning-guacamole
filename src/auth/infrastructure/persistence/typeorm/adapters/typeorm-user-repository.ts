import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { IUserRepository } from '@/auth/application/repositories/user.repository';
import { UserSchema } from '@/auth/infrastructure/persistence/typeorm/schemas/user.schema';
import { BaseRepository } from '@/database/base.repository';
import { User } from '@/auth/domain/aggregates/user.aggregate';
import { UserMapper } from '../../mappers/user.mapper';

@Injectable()
export class TypeORMUserRepository
  extends BaseRepository<UserSchema>
  implements IUserRepository
{
  constructor(datasource: DataSource) {
    super(datasource, UserSchema);
  }

  async count(): Promise<number> {
    return await this.repository.count();
  }

  async findOneById(id: string): Promise<User | null> {
    const userModel = await this.repository.findOne({
      where: {
        id,
      },
    });
    return userModel ? UserMapper.fromModelToDomain(userModel) : null;
  }

  async findOneByUsername(username: string): Promise<User | null> {
    const userModel = await this.repository.findOne({
      where: {
        username,
      },
    });
    return userModel ? UserMapper.fromModelToDomain(userModel) : null;
  }

  async save(user: User): Promise<User> {
    await this.repository.save(UserMapper.toPersistance(user));
    return user;
  }
}
