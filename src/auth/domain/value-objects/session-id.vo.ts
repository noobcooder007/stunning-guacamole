import { v4 as uuidv4 } from 'uuid';
import { GeneralGuard } from '@/shared/domain/guards/general.guard';
import { ValueObject } from '@/shared/domain/vo/value-objet';

export class SessionId extends ValueObject<string> {
  private constructor(value: string) {
    GeneralGuard.againstNullOrUndefined(
      value,
      'Id cannot be null or undefined',
      SessionId.name,
    );
    super(value);
  }

  public static create() {
    return new SessionId(uuidv4());
  }

  public static of(value: string): SessionId {
    GeneralGuard.againstValueIsUUID(value, SessionId.name);
    return new SessionId(value);
  }

  public toString(): string {
    return this.value;
  }
}
