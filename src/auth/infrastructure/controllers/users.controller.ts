import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  UseInterceptors,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { Throttle, minutes } from '@nestjs/throttler';
import { Auth } from '@/auth/infrastructure/decorators/auth.decorator';
import { PermissionNames } from '@/auth/domain/constants/permissions';
import { GetAllUsersQuery } from '@/auth/application/queries/get-all-users.query';
import { SetUserActiveStatusCommand } from '@/auth/application/commands/set-user-active-status.command';
import { ChangeUserPasswordCommand } from '@/auth/application/commands/change-user-password.command';
import { ChangeUsernameCommand } from '@/auth/application/commands/change-username.command';
import { ChangeUserPasswordDto } from '@/auth/application/dto/change-user-password.dto';
import { ChangeUsernameDto } from '@/auth/application/dto/change-username.dto';
import { IsBoolean } from 'class-validator';

class SetActiveStatusDto {
  @IsBoolean()
  isActive: boolean;
}

@Controller('users')
export class UsersController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  @Auth(PermissionNames.VIEW_USER)
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(minutes(2))
  findAll() {
    return this.queryBus.execute(new GetAllUsersQuery());
  }

  @Patch(':id/status')
  @Auth(PermissionNames.EDIT_USER)
  setStatus(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: SetActiveStatusDto,
  ) {
    return this.commandBus.execute(
      new SetUserActiveStatusCommand(id, dto.isActive),
    );
  }

  @Throttle({ default: { limit: 5, ttl: minutes(1) } })
  @Patch(':id/password')
  @Auth(PermissionNames.EDIT_USER)
  changePassword(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: ChangeUserPasswordDto,
  ) {
    return this.commandBus.execute(
      new ChangeUserPasswordCommand(id, dto.newPassword),
    );
  }

  @Patch(':id/username')
  @Auth(PermissionNames.EDIT_USER)
  changeUsername(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: ChangeUsernameDto,
  ) {
    return this.commandBus.execute(
      new ChangeUsernameCommand(id, dto.username),
    );
  }
}
