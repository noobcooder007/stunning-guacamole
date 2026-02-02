import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class AddressResponseDto {
  @Expose({ groups: ['superadministrator', 'administrator', 'owner'] })
  street: string;
  @Expose({ groups: ['superadministrator', 'administrator', 'owner'] })
  noExt: string;
  @Expose({ groups: ['superadministrator', 'administrator', 'owner'] })
  noInt: string;
  @Expose({ groups: ['superadministrator', 'administrator', 'owner'] })
  neighborhood: string;
  @Expose({ groups: ['superadministrator', 'administrator', 'owner'] })
  locality: string;
  @Expose()
  city: string;
  @Expose()
  state: string;
  @Expose()
  zipCode: string;
}
