import { unlink } from 'fs';
import { join } from 'path';
import {
  Body,
  Controller,
  Get,
  Param,
  ParseFilePipeBuilder,
  ParseUUIDPipe,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { FileInterceptor } from '@nestjs/platform-express';
import { Auth } from '@/auth/infrastructure/decorators/auth.decorator';
import { profileMulterOptions } from '@/shared/infrastructure/interceptors/multer.constants';
import { validateImageFile } from '@/shared/infrastructure/utils/file-validator.util';
import { CreateCollectorCommand } from '@/community/application/command/create-collector.command';
import { DeactivateCollectorCommand } from '@/community/application/command/deactivate-collector.command';
import { ReactivateCollectorCommand } from '@/community/application/command/reactivate-collector.command';
import { GetCollectorQueryParams } from '@/community/application/query/get-collector-paginated.query';
import { GetCollectorByIdQuery } from '@/community/application/query/get-collector-by-id.query';
import { CreateCollectorDto } from '@/community/application/dto/create-collector.dto';
import { GetCollectorsQueryDto } from '@/community/application/dto/get-collectors-query.dto';

@Controller('collector')
export class CollectorController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
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
      dto.bank,
      dto.reference,
      dto.notes,
      file.filename,
      dto.secondLastname,
      dto.address.numeration.noInt,
      dto.address.neighborhood,
      dto.address.locality,
      dto.telephoneNumber,
    );
    command.profilePath = file.filename;
    try {
      return await this.commandBus.execute(command);
    } catch (error) {
      if (file) {
        unlink(
          join(process.cwd(), 'images/profile-pictures', file.filename),
          (err) => {
            if (err) console.error(err);
          },
        );
      }
      throw error;
    }
  }

  @Get()
  // @Auth()
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
  @Auth()
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.queryBus.execute(new GetCollectorByIdQuery(id));
  }

  @Post(':id/deactivate')
  @Auth()
  desactivate(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.commandBus.execute(new DeactivateCollectorCommand(id));
  }

  @Post(':id/reactivate')
  @Auth()
  reactivate(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.commandBus.execute(new ReactivateCollectorCommand(id));
  }
}
