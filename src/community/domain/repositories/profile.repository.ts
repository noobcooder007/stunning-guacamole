import { Injectable } from '@nestjs/common';
import { Profile } from '@/community/domain/aggregate/profile.aggregate';
import { ProfileFilters } from '@/community/infrastructure/persistence/typeorm/adapters/typeorm-profile.repository';

@Injectable()
export abstract class IProfileRepository {
  abstract exists(filters: ProfileFilters): Promise<boolean>;
  abstract findById(id: string): Promise<Profile | null>;
  abstract save(profile: Profile): Promise<void>;
}
