import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateCollectorCommand } from '@/community/application/command/create-collector.command';
import { GetCollectorQueryParams } from '@/community/application/query/get-collector-paginated.query';
import { AssignBeneficientsCommand } from '@/community/application/command/assign-beneficients.command';
import { AssignBeneficientsDto } from '@/community/application/dto/assign-beneficients.dto';

@Controller('collector')
export class CollectorController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  create(@Body() command: CreateCollectorCommand) {
    return this.commandBus.execute(command);
  }

  @Get()
  findAll(@Body() params: GetCollectorQueryParams) {
    return this.queryBus.execute(params);
  }

  // #TODO dividir las operaciones del repo y delegar logica de negocio en el handler
  @Post(':collectorId/assign-beneficients')
  assignBeneficientsToCollector(
    @Param('collectorId', new ParseUUIDPipe()) collectorId: string,
    @Body() dto: AssignBeneficientsDto,
  ) {
    return this.commandBus.execute(
      new AssignBeneficientsCommand(collectorId, dto.beneficientsIds),
    );
  }
}
