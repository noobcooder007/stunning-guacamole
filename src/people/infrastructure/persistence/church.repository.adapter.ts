import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Church } from '@/people/domain/aggregate/church.aggregate';
import { ChurchRepository } from '@/people/domain/repositories/church.repository';
import { ChurchModel } from '@/people/infrastructure/models/church.model';

@Injectable()
export class ChurchRepositoryAdapater implements ChurchRepository {
  constructor(
    @InjectRepository(ChurchModel)
    private readonly churchRepository: Repository<ChurchModel>,
  ) {}

  public create(church: Church): ChurchModel {
    const churchModel = new ChurchModel();
    churchModel.name = church.name;
    churchModel.street = church.address.street;
    churchModel.city = church.address.city;
    churchModel.state = church.address.state;
    churchModel.zipCode = church.address.zipCode;
    churchModel.vicaria = church.vicaria;
    churchModel.decanato = church.decanato;
    churchModel.parroquia = church.parroquia;
    churchModel.capilla = church.capilla;
    churchModel.phoneNumber = church.phoneNumber.value;
    churchModel.principalFirstname = church.principal.firstname;
    churchModel.principalFirstLastname = church.principal.firstLastname;
    churchModel.principalSecondLastname = church.principal.secondLastname;
    churchModel.auxiliarFirstname = church.auxiliar.firstname;
    churchModel.auxiliarFirstLastname = church.auxiliar.firstLastname;
    churchModel.auxiliarSecondLastname = church.auxiliar.secondLastname;
    return churchModel;
  }
  public save(church: ChurchModel): Promise<ChurchModel> {
    return this.churchRepository.save(church);
  }
  public findById(id: string): Promise<ChurchModel> {
    return this.churchRepository.findOne({ where: { id } });
  }
  public findAll(
    offset: number = 0,
    limit: number = 10,
  ): Promise<ChurchModel[]> {
    return this.churchRepository.find({
      skip: offset,
      take: limit,
    });
  }
  public update(id: string, church: Church): Promise<ChurchModel> {
    throw new Error('Method not implemented.');
  }
  public delete(id: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
