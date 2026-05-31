import { IsNotEmpty, IsString, MaxLength, Matches } from 'class-validator';

export class CreatePermissionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @Matches(/^[a-z0-9]+(?::[a-z0-9-]+)*$/, {
    message: 'Name must follow the pattern action:resource (e.g. view:church)',
  })
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  description: string;
}
