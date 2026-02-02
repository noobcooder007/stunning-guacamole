import { GeneralGuard } from '@/shared/domain/guards/general.guard';
import { ValueObject } from '@/shared/domain/vo/value-objet';

export class NSS extends ValueObject<string> {
  private constructor(value: string) {
    const onlyDigits = String(value).replace(/\D/g, '');
    GeneralGuard.againstLengthIsEqualsTo(
      onlyDigits,
      11,
      'Invalid NSS length. It should be 11 digits',
      NSS.name,
    );
    super(onlyDigits);
  }

  public static of(value: string): NSS {
    return new NSS(value);
  }
}
