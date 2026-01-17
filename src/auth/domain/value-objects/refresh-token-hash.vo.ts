import { GeneralGuard } from '@/shared/domain/guards/general.guard';
import { ValueObject } from '@/shared/domain/vo/value-objet';
import { ITokenHasher } from '@/auth/domain/services/token-hasher.service';

export class RefreshTokenHash extends ValueObject<string> {
  private constructor(value: string) {
    GeneralGuard.againstNullOrUndefined(
      value,
      'Id cannot be null or undefined',
      RefreshTokenHash.name,
    );
    super(value);
  }

  public static of(value: string): RefreshTokenHash {
    GeneralGuard.againstNullOrUndefined(
      value,
      'Value is required',
      RefreshTokenHash.name,
    );
    return new RefreshTokenHash(value);
  }

  public toString(): string {
    return this.value;
  }

  public async compare(
    plainToken: string,
    hasher: ITokenHasher,
  ): Promise<boolean> {
    const incomingHash = await hasher.hash(plainToken);
    return await hasher.safeCompare(incomingHash, this.value);
  }
}
