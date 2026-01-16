import { v4 as uuidv4 } from 'uuid';
import { GeneralGuard } from '@/shared/domain/guards/general.guard';

export class SessionId {
  constructor(private readonly value: string) {
    GeneralGuard.againstNullOrUndefined(
      value,
      'Id cannot be null or undefined',
      SessionId.name,
    );
  }

  public static of(): SessionId {
    return new SessionId(uuidv4());
  }

  public toString(): string {
    return this.value;
  }
}

export interface SessionProps {
  sessionId: SessionId;
  userId: string;
  hashRefreshToken: string;
  expiresAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
  ip: string;
  userAgent: string;
  revoked?: boolean;
}

export class Session {
  constructor(private props: SessionProps) {
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
      props.ip,
      'Ip cannot be null or undefined',
      Session.name,
    );
    GeneralGuard.againstNullOrUndefined(
      props.userAgent,
      'User agent cannot be null or undefined',
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

  public get sessionId(): string {
    return this.props.sessionId.toString();
  }

  public get userId(): string {
    return this.props.userId;
  }

  public get hashRefreshToken(): string {
    return this.props.hashRefreshToken;
  }

  public get expiresAt(): Date {
    return this.props.expiresAt;
  }

  public get createdAt(): Date {
    return this.props.createdAt;
  }

  public get updatedAt(): Date {
    return this.props.updatedAt;
  }

  public get ip(): string {
    return this.props.ip;
  }

  public get userAgent(): string {
    return this.props.userAgent;
  }

  public get revoked(): boolean {
    return this.props.revoked;
  }

  updateSession(hashRefreshToken: string, expiresAt: Date) {
    this.props.hashRefreshToken = hashRefreshToken;
    this.props.expiresAt = expiresAt;
    this.props.updatedAt = new Date();
  }

  public set revoked(value: boolean) {
    this.props.revoked = value;
  }
}
