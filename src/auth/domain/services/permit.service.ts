import { Inject, Injectable } from '@nestjs/common';
import { PermitRepository } from '@/auth/domain/repositories/permit.repository';

@Injectable()
export class PermitService {
  constructor(
    @Inject(PermitRepository)
    private readonly permitRepository: PermitRepository,
  ) {}

  async findByRoleId(role: string) {
    return await this.permitRepository.findByRoleId(role);
  }
}
