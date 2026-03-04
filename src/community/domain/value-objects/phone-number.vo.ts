import { ErrorType } from '@/shared/domain/dto/result.dto';
import { DomainException } from '@/shared/domain/exceptions/domain.exception';
import { ValueObject } from '@/shared/domain/vo/value-objet';

export class PhoneNumber extends ValueObject<string> {
  private constructor(value: string) {
    const onlyDigits = String(value).replace(/\D/g, '');
    if (onlyDigits.length !== 10) {
      throw new DomainException(
        'Invalid phone number length. It should be 10 digits.',
        PhoneNumber.name,
        ErrorType.VALIDATION,
      );
    }
    super(value);
  }

  public static of(value: string): PhoneNumber {
    return new PhoneNumber(value);
  }

  public updateWith(value: string): PhoneNumber {
    if (value === undefined) return this;
    const nextPhoneNumber = PhoneNumber.of(value);
    return this.equals(nextPhoneNumber) ? this : nextPhoneNumber;
  }
}
