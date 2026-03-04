import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class CreatePromiseDonationResponse {
  @Expose()
  id: string;
}
