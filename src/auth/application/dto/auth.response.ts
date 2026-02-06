import { Exclude, Expose, Type } from 'class-transformer';

export class UserDto {
  @Expose()
  username: string;
  @Expose()
  role: string;
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
}

export class AuthResponse {
  @Expose()
  @Type(() => UserDto)
  user: UserDto;
  @Expose()
  @Type(() => SessionDto)
  tokens: SessionDto;
}
