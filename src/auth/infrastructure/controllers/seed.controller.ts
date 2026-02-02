import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { SetupGuard } from '@/auth/infrastructure/guards/setup.guard';
import { SeedCommand } from '@/auth/application/commands/seed.command';
import { SeedDto } from '@/auth/application/dto/seed.dto';

@Controller('seed/admin')
export class SeedController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post()
  @UseGuards(SetupGuard)
  async seedAdmin(@Body() dto: SeedDto) {
    return await this.commandBus.execute(
      new SeedCommand(dto.username, dto.password),
    );
  }
}
