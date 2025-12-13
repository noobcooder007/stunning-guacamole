export class Priest {
  id: string;
  firstname: string;
  firstLastname: string;
  secondLastname: string;

  public setId(id: string): Priest {
    this.id = id;
    return this;
  }

  public setFirstname(firstname: string): Priest {
    this.firstname = firstname;
    return this;
  }

  public setFirstLastname(firstLastname: string): Priest {
    this.firstLastname = firstLastname;
    return this;
  }

  public setSecondLastname(secondLastname: string): Priest {
    this.secondLastname = secondLastname;
    return this;
  }

  public build(): Priest {
    return this;
  }
}
