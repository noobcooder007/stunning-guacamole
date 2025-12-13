import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class RefreshTokenRequest {
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
  @IsUUID()
  @IsNotEmpty()
  sessionId: string;
}
