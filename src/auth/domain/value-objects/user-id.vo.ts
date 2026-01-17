import { v4 as uuidv4 } from 'uuid';
import { GeneralGuard } from '@/shared/domain/guards/general.guard';
import { ValueObject } from '@/shared/domain/vo/value-objet';
import { SessionId } from '@/auth/domain/value-objects/session-id.vo';

export class UserId extends ValueObject<string> {
  private constructor(value: string) {
    GeneralGuard.againstNullOrUndefined(
      value,
      'Id cannot be null or undefined',
      UserId.name,
    );
    super(value);
  }

  public static create(): UserId {
    return new UserId(uuidv4());
  }

  public static of(value: string): SessionId {
    GeneralGuard.againstValueIsUUID(value, UserId.name);
    return new UserId(value);
  }

  public toString(): string {
    return this.value;
  }
}
