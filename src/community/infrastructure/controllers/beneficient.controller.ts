import { Body, Controller, Get, Post } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GetBeneficientQueryParams } from '@/community/application/query/get-beneficient-paginated.query';
import { CreateBeneficientCommand } from '@/community/application/command/create-beneficient.command';

@Controller('beneficient')
export class BeneficientController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  create(@Body() command: CreateBeneficientCommand) {
    return this.commandBus.execute(command);
  }

  @Get()
  async findAll(@Body() params: GetBeneficientQueryParams) {
    return await this.queryBus.execute(params);
  }

  // @Get('unassigned')
  // unassignedBeneficients() {
  //   return this.beneficientService.unassignedBeneficients();
  // }

  // @Patch(':id')
  // updateBeneficient(
  //   @Param('id', new ParseUUIDPipe()) id: string,
  //   @Body() updateBeneficientDto: UpdateBeneficientCommand,
  // ) {
  //   return this.beneficientService.update(id, updateBeneficientDto);
  // }
}
