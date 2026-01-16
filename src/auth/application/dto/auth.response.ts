import { Exclude, Expose, Type } from 'class-transformer';

export class UserDto {
  @Expose()
  username: string;
  @Expose()
  role: string;
  constructor(partial: Partial<UserDto>) {
    Object.assign(this, partial);
  }
}

export class SessionDto {
  @Expose()
  accessToken: string;
  @Expose()
  expiresIn: number;
  @Exclude()
  refreshToken: string;
  @Expose()
  refreshExpiresIn: number;
  @Expose()
  sessionId: string;
  constructor(partial: Partial<SessionDto>) {
    Object.assign(this, partial);
  }
}

export class AuthResponse {
  @Expose()
  @Type(() => UserDto)
  user: UserDto;
  @Expose()
  @Type(() => SessionDto)
  tokens: SessionDto;
  constructor(partial: Partial<AuthResponse>) {
    Object.assign(this, partial);
  }
}
