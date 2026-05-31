import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Auth } from '@/auth/infrastructure/decorators/auth.decorator';
import { PermissionNames } from '@/auth/domain/constants/permissions';
import { AssignBeneficientsCommand } from '@/community/application/command/assign-beneficients.command';
import { ReassignBeneficientsCommand } from '@/community/application/command/reassign-beneficients.command';
import { DeactivateAssignationsCommand } from '@/community/application/command/deactivate-assignations.command';
import { GetActiveAssignationsQuery } from '@/community/application/query/get-active-assignations.query';
import { GetOrphansAssignationsQuery } from '@/community/application/query/get-orphans-assignations.query';
import { AssignBeneficientsDto } from '@/community/application/dto/assign-beneficients.dto';
import { ReassignAssignationsDto } from '@/community/application/dto/reassign-assignations.dto';
import { DeactivateAssignationsDto } from '@/community/application/dto/deactivate-assignations.dto';
import { GetActiveAssignationsQueryDto } from '@/community/application/dto/get-active-assignations-query.dto';

@Controller('assignment')
export class AssignmentController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @Auth(PermissionNames.EDIT_COLLECTOR)
  assignBeneficientsToCollector(@Body() dto: AssignBeneficientsDto) {
    return this.commandBus.execute(
      new AssignBeneficientsCommand(dto.collectorId, dto.beneficientsIds),
    );
  }

  @Post('reasign')
  @Auth(PermissionNames.EDIT_COLLECTOR)
  reasignBeneficientsToCollector(@Body() dto: ReassignAssignationsDto) {
    return this.commandBus.execute(
      new ReassignBeneficientsCommand(
        dto.collectorId,
        dto.reassignAssignations,
      ),
    );
  }

  @Post('deactivate')
  @Auth(PermissionNames.EDIT_COLLECTOR)
  deactivateAssignations(@Body() dto: DeactivateAssignationsDto) {
    return this.commandBus.execute(
      new DeactivateAssignationsCommand(dto.deactivateAssignations),
    );
  }

  @Get('actives')
  @Auth(PermissionNames.VIEW_COLLECTOR)
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
  @Auth(PermissionNames.VIEW_COLLECTOR)
  getOrphans() {
    return this.queryBus.execute(new GetOrphansAssignationsQuery());
  }
}
