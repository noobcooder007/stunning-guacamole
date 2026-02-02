import { AggregateRoot } from '@nestjs/cqrs';
import { v4 as uuidv4 } from 'uuid';
import { GeneralGuard } from '@/shared/domain/guards/general.guard';
import { ValueObject } from '@/shared/domain/vo/value-objet';
import { ITokenHasher } from '@/auth/domain/services/token-hasher.service';
import { RefreshTokenHash } from '@/auth/domain/value-objects/refresh-token-hash.vo';
import { ExpiresAtDate } from '@/auth/domain/value-objects/expires-at-date.vo';
import { SessionMetadata } from '@/auth/domain/value-objects/session-metadata.vo';
import { UserId } from '@/auth/domain/aggregates/user.aggregate';

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

export interface SessionProps {
  sessionId: SessionId;
  userId: UserId;
  hashRefreshToken: RefreshTokenHash;
  expiresAt: ExpiresAtDate;
  createdAt?: Date;
  updatedAt?: Date;
  sessionMetadata: SessionMetadata;
  revoked?: boolean;
}

export class Session extends AggregateRoot {
  private constructor(private props: SessionProps) {
    super();
    GeneralGuard.againstNullOrUndefined(
      props.sessionId,
      'Session id cannot be null or undefined',
      Session.name,
    );
    GeneralGuard.againstNullOrUndefined(
      props.userId,
      'User id cannot be null or undefined',
      Session.name,
    );
    GeneralGuard.againstNullOrUndefined(
      props.hashRefreshToken,
      'Hash refresh token cannot be null or undefined',
      Session.name,
    );
    GeneralGuard.againstNullOrUndefined(
      props.expiresAt,
      'Expires at cannot be null or undefined',
      Session.name,
    );
    GeneralGuard.againstNullOrUndefined(
      props.createdAt,
      'Created at cannot be null or undefined',
      Session.name,
    );
    GeneralGuard.againstNullOrUndefined(
      props.sessionMetadata,
      'Session metadata cannot be null or undefined',
      Session.name,
    );
    GeneralGuard.againstNullOrUndefined(
      props.revoked,
      'Revoked cannot be null or undefined',
      Session.name,
    );
  }

  public static create(props: SessionProps) {
    const data: SessionProps = {
      ...props,
      createdAt: new Date(),
      updatedAt: new Date(),
      revoked: false,
    };
    return new Session(data);
  }

  public static recreate(props: SessionProps) {
    return new Session(props);
  }

  public get sessionId(): SessionId {
    return this.props.sessionId;
  }

  public get userId(): UserId {
    return this.props.userId;
  }

  public get hashRefreshToken(): RefreshTokenHash {
    return this.props.hashRefreshToken;
  }

  public get expiresAt(): ExpiresAtDate {
    return this.props.expiresAt;
  }

  public get createdAt(): Date {
    return this.props.createdAt;
  }

  public get updatedAt(): Date {
    return this.props.updatedAt;
  }

  public get sessionMetadata(): SessionMetadata {
    return this.props.sessionMetadata;
  }

  public get revoked(): boolean {
    return this.props.revoked;
  }

  updateSession(hashRefreshToken: RefreshTokenHash, expiresAt: ExpiresAtDate) {
    this.props.hashRefreshToken = hashRefreshToken;
    this.props.expiresAt = expiresAt;
    this.props.updatedAt = new Date();
  }

  async validateToken(
    plainToken: string,
    userAgent: string,
    hasher: ITokenHasher,
  ): Promise<boolean> {
    if (
      !this.revoked ||
      this.expiresAt.isAlive() ||
      this.sessionMetadata.validateFingerprint(userAgent)
    ) {
      return true;
    }
    return await this.hashRefreshToken.compare(plainToken, hasher);
  }

  public revokeSession() {
    this.props.revoked = true;
    this.props.updatedAt = new Date();
  }
}
