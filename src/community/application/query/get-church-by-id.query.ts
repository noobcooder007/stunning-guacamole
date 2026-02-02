import { IsNotEmpty, IsUUID } from 'class-validator';

export class GetChurchByIdQuery {
  @IsUUID()
  @IsNotEmpty()
  id: string;
}
