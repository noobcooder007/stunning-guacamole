import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Res,
  UseInterceptors,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Response } from 'express';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { Throttle, minutes } from '@nestjs/throttler';
import { Auth } from '@/auth/infrastructure/decorators/auth.decorator';
import { PermissionNames } from '@/auth/domain/constants/permissions';
import { GetBeneficientQueryParams } from '@/community/application/query/get-beneficient-paginated.query';
import { GetBeneficientsActiveListQuery } from '@/community/application/query/get-beneficients-active-list.query';
import { CreateBeneficientCommand } from '@/community/application/command/create-beneficient.command';
import { CreateBeneficientDto } from '@/community/application/dto/create-beneficient.dto';
import { GetBeneficientByIdQuery } from '@/community/application/query/get-beneficient-by-id.query';
import { GetBeneficientsQueryDto } from '../../application/dto/get-beneficients-query.dto';
import { DeactivateBeneficientCommand } from '@/community/application/command/deactivate-beneficient.command';
import { DeactivateBeneficientDto } from '@/community/application/dto/deactivate-beneficient.dto';
import { PaginationDto } from '@/shared/infrastructure/dto/pagination.dto';
import { GetBeneficientsReportQuery } from '@/community/application/query/get-beneficients-report.query';
import { PrintBeneficientsReportCommand } from '@/community/application/command/print-beneficients-report.command';
import { GetBeneficientsRegistryQuery } from '@/community/application/query/get-beneficients-registry.query';
import { PrintBeneficientsRegistryCommand } from '@/community/application/command/print-beneficients-registry.command';
import { GetUnassignedBeneficientsQuery } from '@/community/application/query/get-unassigned-beneficients.query';
import { GetUnassignedBeneficientsQueryDto } from '@/community/application/dto/get-unassigned-beneficients-query.dto';
import {
  UpdateBeneficientAddressCommand,
  UpdateBeneficientChurchCommand,
  UpdateBeneficientContactCommand,
  UpdateBeneficientPersonalCommand,
  UpdateBeneficientPrivacyCommand,
  UpdateBeneficientTaxCommand,
} from '@/community/application/command/update-beneficient.command';
import {
  UpdateBeneficientAddressDto,
  UpdateBeneficientChurchDto,
  UpdateBeneficientContactDto,
  UpdateBeneficientPersonalDto,
  UpdateBeneficientPrivacyDto,
  UpdateBeneficientTaxDto,
} from '@/community/application/dto/update-beneficient.dto';

@Controller('beneficient')
export class BeneficientController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @Auth(PermissionNames.ADD_BENEFICIENT)
  create(@Body() dto: CreateBeneficientDto) {
    return this.commandBus.execute(
      new CreateBeneficientCommand(
        dto.title,
        dto.firstname,
        dto.firstLastname,
        dto.secondLastname,
        dto.birthday,
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
        dto.weddingAnniversary,
        dto.person,
        dto.registeredName,
        dto.rfc,
        dto.email,
        dto.phoneNumber,
      ),
    );
  }

  @Get('report')
  @Auth(PermissionNames.VIEW_BENEFICIENT)
  async getReport(@Query() params: PaginationDto) {
    return this.queryBus.execute(
      new GetBeneficientsReportQuery(params.page, params.limit),
    );
  }

  @Throttle({ default: { limit: 10, ttl: minutes(1) } })
  @Get(':id/report/pdf')
  @Auth(PermissionNames.VIEW_BENEFICIENT)
  async printReport(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Res() res: Response,
  ) {
    const result = await this.commandBus.execute(
      new PrintBeneficientsReportCommand(id),
    );
    if (!result.isSuccess) {
      res.status(result.error.type === 'NOT_FOUND' ? 404 : 422).json({
        type: result.error.type,
        message: result.error.message,
      });
      return;
    }
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=reporte-bienhechor-${id}.pdf`,
    );
    result.value.pipe(res);
  }

  @Get('registry')
  @Auth(PermissionNames.VIEW_BENEFICIENT)
  async getRegistry(@Query() params: PaginationDto) {
    return this.queryBus.execute(
      new GetBeneficientsRegistryQuery(params.page, params.limit),
    );
  }

  @Throttle({ default: { limit: 10, ttl: minutes(1) } })
  @Get('registry/pdf')
  @Auth(PermissionNames.VIEW_BENEFICIENT)
  async printRegistry(@Res() res: Response) {
    const result = await this.commandBus.execute(
      new PrintBeneficientsRegistryCommand(),
    );
    if (!result.isSuccess) {
      res
        .status(422)
        .json({ type: result.error.type, message: result.error.message });
      return;
    }
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=registro-bienhechores.pdf',
    );
    result.value.pipe(res);
  }

  @Get()
  @Auth(PermissionNames.VIEW_BENEFICIENT)
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

  @Get('active-list')
  @Auth(PermissionNames.VIEW_BENEFICIENT)
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(minutes(2))
  getActiveList(@Query('search') search?: string) {
    return this.queryBus.execute(new GetBeneficientsActiveListQuery(search));
  }

  @Get('unassigned')
  @Auth(PermissionNames.VIEW_BENEFICIENT)
  getUnassigned(@Query() params: GetUnassignedBeneficientsQueryDto) {
    return this.queryBus.execute(
      new GetUnassignedBeneficientsQuery(
        params.firstname,
        params.firstLastname,
        params.secondLastname,
        params.page,
        params.limit,
      ),
    );
  }

  @Get(':id')
  @Auth(PermissionNames.VIEW_BENEFICIENT)
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.queryBus.execute(new GetBeneficientByIdQuery(id));
  }

  @Post('deactivate')
  @Auth(PermissionNames.EDIT_BENEFICIENT)
  deactivate(@Body() dto: DeactivateBeneficientDto) {
    return this.commandBus.execute(
      new DeactivateBeneficientCommand(dto.beneficientId, dto.reason),
    );
  }

  @Patch(':id/personal')
  @Auth(PermissionNames.EDIT_BENEFICIENT)
  updatePersonal(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateBeneficientPersonalDto,
  ) {
    return this.commandBus.execute(
      new UpdateBeneficientPersonalCommand(
        id,
        dto.title,
        dto.firstname,
        dto.firstLastname,
        dto.secondLastname,
        dto.birthday,
        dto.genre,
        dto.maritalStatus,
        dto.weddingAnniversary,
      ),
    );
  }

  @Patch(':id/address')
  @Auth(PermissionNames.EDIT_BENEFICIENT)
  updateAddress(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateBeneficientAddressDto,
  ) {
    return this.commandBus.execute(
      new UpdateBeneficientAddressCommand(
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

  @Patch(':id/contact')
  @Auth(PermissionNames.EDIT_BENEFICIENT)
  updateContact(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateBeneficientContactDto,
  ) {
    return this.commandBus.execute(
      new UpdateBeneficientContactCommand(id, dto.email, dto.phoneNumber),
    );
  }

  @Patch(':id/church')
  @Auth(PermissionNames.EDIT_BENEFICIENT)
  updateChurch(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateBeneficientChurchDto,
  ) {
    return this.commandBus.execute(
      new UpdateBeneficientChurchCommand(id, dto.churchId),
    );
  }

  @Patch(':id/tax')
  @Auth(PermissionNames.EDIT_BENEFICIENT)
  updateTax(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateBeneficientTaxDto,
  ) {
    return this.commandBus.execute(
      new UpdateBeneficientTaxCommand(
        id,
        dto.person,
        dto.registeredName,
        dto.rfc,
      ),
    );
  }

  @Patch(':id/privacy')
  @Auth(PermissionNames.EDIT_BENEFICIENT)
  updatePrivacy(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateBeneficientPrivacyDto,
  ) {
    return this.commandBus.execute(
      new UpdateBeneficientPrivacyCommand(id, dto.keepPrivate),
    );
  }
}
