import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Auth } from '@/auth/infrastructure/decorators/auth.decorator';
import { AssignBeneficientsCommand } from '@/community/application/command/assign-beneficients.command';
import { ReassignBeneficientsCommand } from '@/community/application/command/reassign-beneficients.command';
import { DesactivateAssignationsCommand } from '@/community/application/command/desactivate-assignations.command';
import { GetActiveAssignationsQuery } from '@/community/application/query/get-active-assignations.query';
import { GetOrphansAssignationsQuery } from '@/community/application/query/get-orphans-assignations.query';
import { AssignBeneficientsDto } from '@/community/application/dto/assign-beneficients.dto';
import { ReassignAssignationsDto } from '@/community/application/dto/reassign-assignations.dto';
import { DesactivateAssignationsDto } from '@/community/application/dto/desactivate-assignations.dto';
import { GetActiveAssignationsQueryDto } from '@/community/application/dto/get-active-assignations-query.dto';

@Controller('assignment')
export class AssignmentController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @Auth()
  assignBeneficientsToCollector(@Body() dto: AssignBeneficientsDto) {
    return this.commandBus.execute(
      new AssignBeneficientsCommand(dto.collectorId, dto.beneficientsIds),
    );
  }

  @Post('reasign')
  @Auth()
  reasignBeneficientsToCollector(@Body() dto: ReassignAssignationsDto) {
    return this.commandBus.execute(
      new ReassignBeneficientsCommand(
        dto.collectorId,
        dto.reassignAssignations,
      ),
    );
  }

  @Post('deactivate')
  @Auth()
  desactivateAssignations(@Body() dto: DesactivateAssignationsDto) {
    return this.commandBus.execute(
      new DesactivateAssignationsCommand(dto.desactivateAssignations),
    );
  }

  @Get('actives')
  // @Auth()
  getActives(@Query() query: GetActiveAssignationsQueryDto) {
    return this.queryBus.execute(
      new GetActiveAssignationsQuery(
        query.collectorId,
        query.page,
        query.limit,
      ),
    );
  }

  @Get('orphans')
  @Auth()
  getOrphans() {
    return this.queryBus.execute(new GetOrphansAssignationsQuery());
  }
}
