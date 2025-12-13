import { Priest } from '../entities/priest.entity';
import { Address } from '../value-objects/address.vo';
import { PhoneNumber } from '../value-objects/phonenumber.vo';

export class Church {
  id: string;
  name: string;
  vicaria: string;
  decanato: string;
  parroquia: string;
  capilla: string;
  address: Address;
  phoneNumber: PhoneNumber;
  principal: Priest;
  auxiliar: Priest;
  isActive: boolean;

  constructor() {}

  public setId(id: string): Church {
    this.id = id;
    return this;
  }

  public setName(name: string): Church {
    this.name = name;
    return this;
  }

  public setVicaria(vicaria: string): Church {
    this.vicaria = vicaria;
    return this;
  }

  public setDecanato(decanato: string): Church {
    this.decanato = decanato;
    return this;
  }

  public setParroquia(parroquia: string): Church {
    this.parroquia = parroquia;
    return this;
  }

  public setCapilla(capilla: string): Church {
    this.capilla = capilla;
    return this;
  }

  public setAddress(address: Address): Church {
    this.address = address;
    return this;
  }

  public setPhone(phone: string): Church {
    const phoneNumber = new PhoneNumber(phone);
    this.phoneNumber = phoneNumber;
    return this;
  }

  public setPrincipal(principal: Priest): Church {
    this.principal = principal;
    return this;
  }

  public setAuxiliar(auxiliar: Priest): Church {
    this.auxiliar = auxiliar;
    return this;
  }

  public setIsActive(isActive: boolean): Church {
    this.isActive = isActive;
    return this;
  }

  public build(): Church {
    return this;
  }
}
