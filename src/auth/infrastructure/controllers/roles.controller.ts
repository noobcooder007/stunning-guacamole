import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Put,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Auth } from '@/auth/infrastructure/decorators/auth.decorator';
import { PermissionNames } from '@/auth/domain/constants/permissions';
import { AssignPermissionsToRoleCommand } from '@/auth/application/commands/assign-permissions-to-role.command';
import { GetAllRolesQuery } from '@/auth/application/queries/get-all-roles.query';
import { GetRoleByIdQuery } from '@/auth/application/queries/get-role-by-id.query';
import { AssignPermissionsDto } from '@/auth/application/dto/assign-permissions.dto';

@Controller('roles')
export class RolesController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  @Auth(PermissionNames.VIEW_ROLE)
  findAll() {
    return this.queryBus.execute(new GetAllRolesQuery());
  }

  @Get(':id')
  @Auth(PermissionNames.VIEW_ROLE)
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.queryBus.execute(new GetRoleByIdQuery(id));
  }

  @Put(':id/permissions')
  @Auth(PermissionNames.EDIT_ROLE)
  assignPermissions(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: AssignPermissionsDto,
  ) {
    return this.commandBus.execute(
      new AssignPermissionsToRoleCommand(id, dto.permissionIds),
    );
  }
}
