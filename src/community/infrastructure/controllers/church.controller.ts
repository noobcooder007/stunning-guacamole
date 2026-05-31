import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Auth } from '@/auth/infrastructure/decorators/auth.decorator';
import { PermissionNames } from '@/auth/domain/constants/permissions';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateChurchCommand } from '@/community/application/command/create-church.command';
import { GetChurchByIdQuery } from '@/community/application/query/get-church-by-id.query';
import { GetChurchQueryParams } from '@/community/application/query/get-church-paginated.query';
import { GetChurchesQueryDto } from '../../application/dto/get-churches-query.dto';
import {
  UpdateChurchAddressCommand,
  UpdateChurchEcclesialIdentityCommand,
  UpdateChurchPriestCommand,
  UpdateChurchAuxiliarPriestCommand,
  UpdateChurchPhoneNumberCommand,
} from '@/community/application/command/update-church.command';
import {
  UpdateChurchAddressDto,
  UpdateChurchEcclesialIdentityDto,
  UpdateChurchPriestDto,
  UpdateChurchAuxiliarPriestDto,
  UpdateChurchPhoneNumberDto,
} from '@/community/application/dto/update-church.dto';

@Controller('church')
export class ChurchController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @Auth(PermissionNames.ADD_CHURCH)
  async create(@Body() command: CreateChurchCommand) {
    return await this.commandBus.execute(command);
  }

  @Patch(':id/identity')
  @Auth(PermissionNames.EDIT_CHURCH)
  async updateEccesialIdentity(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateChurchEcclesialIdentityDto,
  ) {
    return this.commandBus.execute(
      new UpdateChurchEcclesialIdentityCommand(
        id,
        dto.name,
        dto.vicaria,
        dto.decanato,
        dto.parroquia,
        dto.capilla,
      ),
    );
  }

  @Patch(':id/address')
  @Auth(PermissionNames.EDIT_CHURCH)
  async updateAddress(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateChurchAddressDto,
  ) {
    return this.commandBus.execute(
      new UpdateChurchAddressCommand(
        id,
        dto.street,
        dto.noExt,
        dto.noInt,
        dto.neighborhood,
        dto.locality,
        dto.city,
        dto.state,
        dto.zipCode,
      ),
    );
  }

  @Patch(':id/priest')
  @Auth(PermissionNames.EDIT_CHURCH)
  updatePriest(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateChurchPriestDto,
  ) {
    return this.commandBus.execute(
      new UpdateChurchPriestCommand(
        id,
        dto.firstname,
        dto.firstLastname,
        dto.secondLastname,
      ),
    );
  }

  @Patch(':id/auxiliar')
  @Auth(PermissionNames.EDIT_CHURCH)
  updateAuxiliarPriest(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateChurchAuxiliarPriestDto,
  ) {
    return this.commandBus.execute(
      new UpdateChurchAuxiliarPriestCommand(
        id,
        dto.firstname,
        dto.firstLastname,
        dto.secondLastname,
      ),
    );
  }

  @Patch(':id/phone')
  @Auth(PermissionNames.EDIT_CHURCH)
  updatePhoneNumber(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateChurchPhoneNumberDto,
  ) {
    return this.commandBus.execute(
      new UpdateChurchPhoneNumberCommand(id, dto.phoneNumber),
    );
  }

  @Get()
  @Auth(PermissionNames.LIST_CHURCH)
  async findAll(@Query() query: GetChurchesQueryDto) {
    return await this.queryBus.execute(
      new GetChurchQueryParams(
        query.name,
        query.capilla,
        query.parroquia,
        query.decanato,
        query.vicaria,
        query.page,
        query.limit,
      ),
    );
  }

  @Get(':id')
  @Auth(PermissionNames.VIEW_CHURCH)
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    const params = new GetChurchByIdQuery(id);
    return await this.queryBus.execute(params);
  }
}
