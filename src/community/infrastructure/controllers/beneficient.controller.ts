import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Auth } from '@/auth/infrastructure/decorators/auth.decorator';
import { GetBeneficientQueryParams } from '@/community/application/query/get-beneficient-paginated.query';
import { CreateBeneficientCommand } from '@/community/application/command/create-beneficient.command';
import { CreateBeneficientDto } from '@/community/application/dto/create-beneficient.dto';
import { GetBeneficientByIdQuery } from '@/community/application/query/get-beneficient-by-id.query';
import { GetBeneficientsQueryDto } from '../../application/dto/get-beneficients-query.dto';

@Controller('beneficient')
export class BeneficientController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @Auth()
  create(@Body() dto: CreateBeneficientDto) {
    return this.commandBus.execute(
      new CreateBeneficientCommand(
        dto.title,
        dto.firstname,
        dto.firstLastname,
        dto.secondLastname,
        dto.birthday,
        dto.weddingAniversary,
        dto.genre,
        dto.maritalStatus,
        dto.address.street,
        dto.address.numeration.noExt,
        dto.address.numeration.noInt,
        dto.address.neighborhood,
        dto.address.locality,
        dto.address.city,
        dto.address.state,
        dto.address.zipCode,
        dto.churchId,
        dto.keepPrivate,
        dto.person,
        dto.registeredName,
        dto.rfc,
        dto.email,
        dto.phoneNumber,
      ),
    );
  }

  @Get()
  @Auth()
  async findAll(@Query() params: GetBeneficientsQueryDto) {
    return await this.queryBus.execute(
      new GetBeneficientQueryParams(
        params.firstname,
        params.firstLastname,
        params.secondLastname,
        params.city,
        params.state,
        params.zipCode,
        params.page,
        params.limit,
      ),
    );
  }

  @Get(':id')
  @Auth()
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.queryBus.execute(new GetBeneficientByIdQuery(id));
  }

  // @Put(':id/active')
  // @Auth()
  // desactivate(@Param('id', new ParseUUIDPipe()) id: string) {
  //   return this.commandBus.execute(new DesactivateBeneficientCommand(id));
  // }

  // @Get('unassigned')
  // unassignedBeneficients() {
  //   return this.beneficientService.unassignedBeneficients();
  // }

  // @Patch(':id')
  // updateBeneficient(
  //   @Param('id', new ParseUUIDPipe()) id: string,
  //   @Body() updateBeneficientDto: UpdateBeneficientCommand,
  // ) {
  //   return this.beneficientService.update(id, updateBeneficientDto);
  // }
}
