import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { CreateUserCommand } from '@/auth/application/commands/create-user.command';
import { SetupGuard } from '@/auth/infrastructure/guards/setup.guard';

@Controller('seed/admin')
export class SeedController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post()
  @UseGuards(SetupGuard)
  async seedAdmin(@Body() command: CreateUserCommand) {
    return await this.commandBus.execute(command);
  }
}
