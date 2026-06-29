import { unlink } from 'fs/promises';
import { join } from 'path';
import {
  Body,
  Controller,
  Get,
  Param,
  ParseFilePipeBuilder,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { FileInterceptor } from '@nestjs/platform-express';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { Throttle, minutes } from '@nestjs/throttler';
import { Auth } from '@/auth/infrastructure/decorators/auth.decorator';
import { PermissionNames } from '@/auth/domain/constants/permissions';
import { profileMulterOptions } from '@/shared/infrastructure/interceptors/multer.constants';
import { validateImageFile } from '@/shared/infrastructure/utils/file-validator.util';
import { processProfileImage } from '@/shared/infrastructure/utils/image-processor.util';
import { CreateCollectorCommand } from '@/community/application/command/create-collector.command';
import { DeactivateCollectorCommand } from '@/community/application/command/deactivate-collector.command';
import { ReactivateCollectorCommand } from '@/community/application/command/reactivate-collector.command';
import { GetCollectorQueryParams } from '@/community/application/query/get-collector-paginated.query';
import { GetCollectorByIdQuery } from '@/community/application/query/get-collector-by-id.query';
import { GetCollectorsActiveListQuery } from '@/community/application/query/get-collectors-active-list.query';
import { CreateCollectorDto } from '@/community/application/dto/create-collector.dto';
import { GetCollectorsQueryDto } from '@/community/application/dto/get-collectors-query.dto';
import {
  UpdateCollectorAddressCommand,
  UpdateCollectorContactCommand,
  UpdateCollectorNotesCommand,
  UpdateCollectorPaymentCommand,
  UpdateCollectorPersonalCommand,
} from '@/community/application/command/update-collector.command';
import {
  UpdateCollectorAddressDto,
  UpdateCollectorContactDto,
  UpdateCollectorNotesDto,
  UpdateCollectorPaymentDto,
  UpdateCollectorPersonalDto,
} from '@/community/application/dto/update-collector.dto';

@Controller('collector')
export class CollectorController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Throttle({ default: { limit: 10, ttl: minutes(1) } })
  @Post()
  @Auth(PermissionNames.ADD_COLLECTOR)
  @UseInterceptors(FileInterceptor('profilePicture', profileMulterOptions))
  async create(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addMaxSizeValidator({ maxSize: 1024 * 1024 * 5 })
        .build({ fileIsRequired: true }),
    )
    file: Express.Multer.File,
    @Body() dto: CreateCollectorDto,
  ) {
    await validateImageFile(file);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const processedFilename = `${uniqueSuffix}.webp`;
    const processedPath = join(
      process.cwd(),
      'images',
      'profile-pictures',
      processedFilename,
    );
    await processProfileImage(file.buffer, processedPath);
    const command = new CreateCollectorCommand(
      dto.username,
      dto.password,
      dto.firstname,
      dto.firstLastname,
      dto.nss,
      dto.address.street,
      dto.address.numeration.noExt,
      dto.address.city,
      dto.address.state,
      dto.address.zipCode,
      dto.phoneNumber,
      dto.commissionPercent,
      dto.nomina,
      dto.transportAllowance,
      dto.bank,
      dto.reference,
      dto.notes,
      processedFilename,
      dto.secondLastname,
      dto.address.numeration.noInt,
      dto.address.neighborhood,
      dto.address.locality,
      dto.telephoneNumber,
    );
    command.profilePath = processedFilename;
    try {
      return await this.commandBus.execute(command);
    } catch (error) {
      await unlink(processedPath).catch(() => null);
      throw error;
    }
  }

  @Get('active-list')
  @Auth(PermissionNames.VIEW_COLLECTOR)
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(minutes(2))
  getActiveList(@Query('search') search?: string) {
    return this.queryBus.execute(new GetCollectorsActiveListQuery(search));
  }

  @Get()
  @Auth(PermissionNames.VIEW_COLLECTOR)
  findAll(@Query() query: GetCollectorsQueryDto) {
    return this.queryBus.execute(
      new GetCollectorQueryParams(
        query.firstname,
        query.firstLastname,
        query.secondLastname,
        query.city,
        query.state,
        query.zipCode,
        query.page,
        query.limit,
      ),
    );
  }

  @Get(':id')
  @Auth(PermissionNames.VIEW_COLLECTOR)
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.queryBus.execute(new GetCollectorByIdQuery(id));
  }

  @Post(':id/deactivate')
  @Auth(PermissionNames.EDIT_COLLECTOR)
  deactivate(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.commandBus.execute(new DeactivateCollectorCommand(id));
  }

  @Post(':id/reactivate')
  @Auth(PermissionNames.EDIT_COLLECTOR)
  reactivate(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.commandBus.execute(new ReactivateCollectorCommand(id));
  }

  @Patch(':id/personal')
  @Auth(PermissionNames.EDIT_COLLECTOR)
  updatePersonal(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateCollectorPersonalDto,
  ) {
    return this.commandBus.execute(
      new UpdateCollectorPersonalCommand(
        id,
        dto.firstname,
        dto.firstLastname,
        dto.secondLastname,
      ),
    );
  }

  @Patch(':id/address')
  @Auth(PermissionNames.EDIT_COLLECTOR)
  updateAddress(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateCollectorAddressDto,
  ) {
    return this.commandBus.execute(
      new UpdateCollectorAddressCommand(
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
  @Auth(PermissionNames.EDIT_COLLECTOR)
  updateContact(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateCollectorContactDto,
  ) {
    return this.commandBus.execute(
      new UpdateCollectorContactCommand(
        id,
        dto.phoneNumber,
        dto.telephoneNumber,
      ),
    );
  }

  @Patch(':id/payment')
  @Auth(PermissionNames.EDIT_COLLECTOR)
  updatePayment(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateCollectorPaymentDto,
  ) {
    return this.commandBus.execute(
      new UpdateCollectorPaymentCommand(
        id,
        dto.commissionPercent,
        dto.nomina,
        dto.transportAllowance,
        dto.bank,
        dto.reference,
      ),
    );
  }

  @Patch(':id/notes')
  @Auth(PermissionNames.EDIT_COLLECTOR)
  updateNotes(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateCollectorNotesDto,
  ) {
    return this.commandBus.execute(
      new UpdateCollectorNotesCommand(id, dto.notes),
    );
  }
}
