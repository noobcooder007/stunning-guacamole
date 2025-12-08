import { Injectable, Inject } from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository';
import { User } from '../aggregates/user.aggregate';

@Injectable()
export class UserService {
  constructor(
    @Inject(UserRepository)
    private readonly userRepository: UserRepository,
  ) {}

  async findById(id: string): Promise<User> {
    const userModel = this.userRepository.findOneById(id);
    return new User();
  }
}
