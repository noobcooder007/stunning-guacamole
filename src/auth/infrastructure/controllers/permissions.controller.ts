import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Auth } from '@/auth/infrastructure/decorators/auth.decorator';
import { PermissionNames } from '@/auth/domain/constants/permissions';
import { CreatePermissionCommand } from '@/auth/application/commands/create-permission.command';
import { UpdatePermissionCommand } from '@/auth/application/commands/update-permission.command';
import { DeactivatePermissionCommand } from '@/auth/application/commands/deactivate-permission.command';
import { GetAllPermissionsQuery } from '@/auth/application/queries/get-all-permissions.query';
import { CreatePermissionDto } from '@/auth/application/dto/create-permission.dto';
import { UpdatePermissionDto } from '@/auth/application/dto/update-permission.dto';

@Controller('permissions')
export class PermissionsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  @Auth(PermissionNames.VIEW_PERMISSION)
  findAll() {
    return this.queryBus.execute(new GetAllPermissionsQuery());
  }

  @Post()
  @Auth(PermissionNames.ADD_PERMISSION)
  create(@Body() dto: CreatePermissionDto) {
    return this.commandBus.execute(
      new CreatePermissionCommand(dto.name, dto.description),
    );
  }

  @Patch(':id')
  @Auth(PermissionNames.EDIT_PERMISSION)
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdatePermissionDto,
  ) {
    return this.commandBus.execute(
      new UpdatePermissionCommand(id, dto.description),
    );
  }

  @Post(':id/deactivate')
  @Auth(PermissionNames.DELETE_PERMISSION)
  deactivate(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.commandBus.execute(new DeactivatePermissionCommand(id));
  }
}
