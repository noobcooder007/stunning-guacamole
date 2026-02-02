import { ValueObject } from '@/shared/domain/vo/value-objet';
import { InvalidAttributeException } from '@/shared/domain/exceptions/invalid-attribute-exception.exception';

export class ZipCode extends ValueObject<string> {
  private constructor(value: string) {
    if (!/^\d{5}$/.test(value)) {
      throw new InvalidAttributeException(
        'Invalid zip code format. Must be 5 digits.',
        ZipCode.name,
      );
    }
    super(value);
  }

  public static of(value: string): ZipCode {
    return new ZipCode(value);
  }

  public get value(): string {
    return this.props;
  }

  public equals(anotherZipCode: ZipCode): boolean {
    return this.value === anotherZipCode.value;
  }

  public updateWith(value: string): ZipCode {
    return this.equals(ZipCode.of(value)) ? this : ZipCode.of(value);
  }
}
