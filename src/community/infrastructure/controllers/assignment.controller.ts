import { Body, Controller, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { Auth } from '@/auth/infrastructure/decorators/auth.decorator';
import { AssignBeneficientsCommand } from '@/community/application/command/assign-beneficients.command';
import { AssignBeneficientsDto } from '@/community/application/dto/assign-beneficients.dto';
import { DesactivateAssignationsDto } from '@/community/application/dto/desactivate-assignations.dto';
import { DesactivateAssignationsCommand } from '@/community/application/command/desactivate-assignations.command';

@Controller('assignment')
export class AssignmentController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post()
  @Auth()
  assignBeneficientsToCollector(@Body() dto: AssignBeneficientsDto) {
    return this.commandBus.execute(
      new AssignBeneficientsCommand(dto.collectorId, dto.beneficientsIds),
    );
  }

  @Post('desactivate')
  @Auth()
  desactivateAssignations(@Body() dto: DesactivateAssignationsDto) {
    return this.commandBus.execute(
      new DesactivateAssignationsCommand(dto.desactivateAssignations),
    );
  }
}
