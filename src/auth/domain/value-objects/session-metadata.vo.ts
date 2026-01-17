import { InvalidAttributeException } from '@/shared/domain/exceptions/invalid-attribute-exception.exception';
import { GeneralGuard } from '@/shared/domain/guards/general.guard';
import { ValueObject } from '@/shared/domain/vo/value-objet';

export interface SessionMetadataProps {
  ip: string;
  userAgent: string;
}

export class SessionMetadata extends ValueObject<SessionMetadataProps> {
  private static readonly IPV4_REGEX =
    /^(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}$/;

  private constructor(props: SessionMetadataProps) {
    GeneralGuard.againstNullOrUndefined(
      props.ip,
      'IP cannot be null or undefined',
      SessionMetadata.name,
    );
    GeneralGuard.againstNullOrUndefined(
      props.userAgent,
      'User agent cannot be null or undefined',
      SessionMetadata.name,
    );
    super(props);
  }

  public static of(props: SessionMetadataProps): SessionMetadata {
    GeneralGuard.againstNullOrUndefined(
      props.userAgent,
      'User agent cannot be null or undefined',
      SessionMetadata.name,
    );
    if (!this.isValid(props.ip)) {
      throw new InvalidAttributeException('Invalid IP', SessionMetadata.name);
    }
    return new SessionMetadata(props);
  }

  private static isValid(ip: string): boolean {
    return this.IPV4_REGEX.test(ip) || this.isIPv6(ip);
  }

  private static isIPv6(ip: string): boolean {
    return ip.includes(':') && ip.length <= 45;
  }

  public validateFingerprint(incomingUserAgent: string): boolean {
    return this.value.userAgent === incomingUserAgent;
  }
}
