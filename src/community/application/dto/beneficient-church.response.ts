import { Exclude, Expose, Transform } from 'class-transformer';
import { EcclesialIdentity } from '@/community/domain/value-objects/ecclesial-identity.vo';

@Exclude()
export class BeneficientChurchResponse {
  @Expose()
  id: string;
  @Expose()
  @Transform(({ value }) => {
    return value instanceof EcclesialIdentity ? value.toJSON() : value;
  })
  ecclesialIdentity: EcclesialIdentity | null;
}
