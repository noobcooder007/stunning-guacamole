import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UpdatePermissionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  description: string;
}
