import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { SetupGuard } from '@/auth/infrastructure/guards/setup.guard';
import { SeedCommand } from '@/auth/application/commands/seed.command';

@Controller('seed/admin')
export class SeedController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post()
  @UseGuards(SetupGuard)
  async seedAdmin(@Body() command: SeedCommand) {
    return await this.commandBus.execute(command);
  }
}
