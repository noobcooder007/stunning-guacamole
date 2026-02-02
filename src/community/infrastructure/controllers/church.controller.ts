import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Auth } from '@/auth/infrastructure/decorators/auth.decorator';
import { CreateChurchCommand } from '@/community/application/command/create-church.command';
import { GetChurchByIdQuery } from '@/community/application/query/get-church-by-id.query';
import { GetChurchQueryParams } from '@/community/application/query/get-church-paginated.query';
import { ValidPermitions } from '@/auth/infrastructure/decorators/permit-protected.decorator';
import {
  UpdateChurchAddressCommand,
  UpdateChurchEcclesialIdentityCommand,
  UpdateChurchPriestCommand,
  UpdateChurchAuxiliarPriestCommand,
  UpdateChurchPhoneNumberCommand,
} from '@/community/application/command/update-church.command';
import { ErrorType, Result } from '@/shared/domain/dto/result.dto';

@Controller('church')
export class ChurchController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  // @Auth(ValidPermitions.ADD_CHURCH)
  @Post()
  async create(@Body() command: CreateChurchCommand) {
    return await this.commandBus.execute(command);
  }

  @Put(':id/identity')
  async updateEccesialIdentity(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() command: UpdateChurchEcclesialIdentityCommand,
  ) {
    if (id !== command.id) {
      return Result.fail({
        message: 'The id in the url and the body do not match',
        type: ErrorType.VALIDATION,
        entity: ChurchController.name,
      });
    }
    return this.commandBus.execute(command);
  }

  // @Auth(ValidPermitions.EDIT_CHURCH)
  @Put(':id/address')
  async updateAddress(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() command: UpdateChurchAddressCommand,
  ) {
    if (id !== command.id) {
      return Result.fail({
        message: 'The id in the url and the body do not match',
        type: ErrorType.VALIDATION,
        entity: ChurchController.name,
      });
    }
    return this.commandBus.execute(command);
  }

  @Put(':id/priest')
  updatePriest(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() command: UpdateChurchPriestCommand,
  ) {
    if (id !== command.id) {
      return Result.fail({
        message: 'The id in the url and the body do not match',
        type: ErrorType.VALIDATION,
        entity: ChurchController.name,
      });
    }
    return this.commandBus.execute(command);
  }

  @Put(':id/auxiliar')
  updateAuxiliarPriest(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() command: UpdateChurchAuxiliarPriestCommand,
  ) {
    if (id !== command.id) {
      return Result.fail({
        message: 'The id in the url and the body do not match',
        type: ErrorType.VALIDATION,
        entity: ChurchController.name,
      });
    }
    return this.commandBus.execute(command);
  }

  @Put(':id/phone')
  updatePhoneNumber(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() command: UpdateChurchPhoneNumberCommand,
  ) {
    if (id !== command.id) {
      return Result.fail({
        message: 'The id in the url and the body do not match',
        type: ErrorType.VALIDATION,
        entity: ChurchController.name,
      });
    }
    return this.commandBus.execute(command);
  }

  // @Auth(ValidPermitions.LIST_CHURCH)
  @Get()
  async findAll(@Body() pagination: GetChurchQueryParams) {
    return await this.queryBus.execute(pagination);
  }

  // @Auth(ValidPermitions.VIEW_CHURCH)
  @Get(':id')
  async findOne(@Param() params: GetChurchByIdQuery) {
    return await this.queryBus.execute(params);
  }
}
