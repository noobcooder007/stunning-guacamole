export class BeneficientsRegistryItemDto {
  beneficientNumber: number;
  title: string;
  firstname: string;
  firstLastname: string;
  secondLastname: string | null;
  birthday: Date;
  genre: string;
  maritalStatus: string;
  email: string | null;
  phoneNumber: string | null;
  street: string;
  noExt: string;
  noInt: string | null;
  neighborhood: string | null;
  locality: string | null;
  city: string;
  state: string;
  zipCode: string;
  createdAt: Date;
  reasonDeactivated: string | null;
  isActive: boolean;
  collectorNumber: number | null;
  collectorFirstname: string | null;
  collectorFirstLastname: string | null;
}
