import { Inject, Injectable } from '@nestjs/common';
import { Church } from '@/people/domain/aggregate/church.aggregate';
import { Address } from '@/people/domain/value-objects/address.vo';
import { Priest } from '@/people/domain/entities/priest.entity';
import { CreateChurchDto } from '@/people/infrastructure/dto/create-church.dto';
import { ChurchRepository } from '@/people/domain/repositories/church.repository';
import { UpdateChurchDto } from '@/people/infrastructure/dto/update-church.dto';
import { PaginationDto } from '@/shared/dto/pagination.dto';
import { log } from 'console';

@Injectable()
export class ChurchService {
  constructor(
    @Inject(ChurchRepository)
    private readonly churchRepository: ChurchRepository,
  ) {}

  create(createChurchDto: CreateChurchDto) {
    const church = new Church()
      .setName(createChurchDto.name)
      .setVicaria(createChurchDto.vicaria)
      .setDecanato(createChurchDto.decanato)
      .setParroquia(createChurchDto.parroquia)
      .setCapilla(createChurchDto.capilla)
      .setAddress(
        new Address(
          createChurchDto.street,
          createChurchDto.city,
          createChurchDto.state,
          createChurchDto.zipCode,
        ),
      )
      .setPrincipal(
        new Priest()
          .setFirstname(createChurchDto.principalName)
          .setFirstLastname(createChurchDto.principalFirstLastname)
          .setSecondLastname(createChurchDto.principalSecondLastname)
          .build(),
      )
      .setAuxiliar(
        new Priest()
          .setFirstname(createChurchDto.auxiliarName)
          .setFirstLastname(createChurchDto.auxiliarFirstLastname)
          .setSecondLastname(createChurchDto.auxiliarSecondLastname)
          .build(),
      )
      .setPhone(createChurchDto.phoneNumber)
      .build();
    const churchModel = this.churchRepository.create(church);
    this.churchRepository.save(churchModel);
  }
  async update(id: string, updateChurchDto: UpdateChurchDto) {
    const churchModel = await this.churchRepository.findById(id);
    churchModel.name = updateChurchDto.name ?? churchModel.name;
    churchModel.vicaria = updateChurchDto.vicaria ?? churchModel.vicaria;
    churchModel.decanato = updateChurchDto.decanato ?? churchModel.decanato;
    churchModel.parroquia = updateChurchDto.parroquia ?? churchModel.parroquia;
    churchModel.capilla = updateChurchDto.capilla ?? churchModel.capilla;
    churchModel.street = updateChurchDto.street ?? churchModel.street;
    churchModel.city = updateChurchDto.city ?? churchModel.city;
    churchModel.state = updateChurchDto.state ?? churchModel.state;
    churchModel.zipCode = updateChurchDto.zipCode ?? churchModel.zipCode;
    churchModel.principalFirstname =
      updateChurchDto.principalName ?? churchModel.principalFirstname;
    churchModel.principalFirstLastname =
      updateChurchDto.principalFirstLastname ??
      churchModel.principalFirstLastname;
    churchModel.principalSecondLastname =
      updateChurchDto.principalSecondLastname ??
      churchModel.principalSecondLastname;
    churchModel.auxiliarFirstname =
      updateChurchDto.auxiliarName ?? churchModel.auxiliarFirstname;
    churchModel.auxiliarFirstLastname =
      updateChurchDto.auxiliarFirstLastname ??
      churchModel.auxiliarFirstLastname;
    churchModel.auxiliarSecondLastname =
      updateChurchDto.auxiliarSecondLastname ??
      churchModel.auxiliarSecondLastname;
    churchModel.phoneNumber =
      updateChurchDto.phoneNumber ?? churchModel.phoneNumber;
    this.churchRepository.save(churchModel);
  }

  async findAll(paginationDto: PaginationDto) {
    const churches = await this.churchRepository.findAll(
      paginationDto.page,
      paginationDto.limit,
    );
    log(churches);
    return churches.map((church) => {
      return new Church()
        .setId(church.id)
        .setName(church.name)
        .setVicaria(church.vicaria)
        .setDecanato(church.decanato)
        .setParroquia(church.parroquia)
        .setCapilla(church.capilla)
        .setAddress(
          new Address(church.street, church.city, church.state, church.zipCode),
        )
        .setPrincipal(
          new Priest()
            .setFirstname(church.principalFirstname)
            .setFirstLastname(church.principalFirstLastname)
            .setSecondLastname(church.principalSecondLastname)
            .build(),
        )
        .setAuxiliar(
          new Priest()
            .setFirstname(church.auxiliarFirstname)
            .setFirstLastname(church.auxiliarFirstLastname)
            .setSecondLastname(church.auxiliarSecondLastname)
            .build(),
        )
        .setPhone(church.phoneNumber)
        .build();
    });
  }

  findOne(id: string) {
    return this.churchRepository.findById(id);
  }

  remove(id: string) {
    return this.churchRepository.delete(id);
  }
}
