import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Auth } from '@/auth/infrastructure/decorators/auth.decorator';
import { PermissionNames } from '@/auth/domain/constants/permissions';
import { GetUser } from '@/auth/infrastructure/decorators/get-user.decorator';
import { CreatePromiseDonationDto } from '@/donation/application/dto/create-promise-donation.dto';
import { GetPromiseDonationsQueryDto } from '@/donation/application/dto/get-promise-donations-query.dto';
import { CreatePromiseDonationCommand } from '@/donation/application/command/create-promise-donation.command';
import { GetPromiseDonationByIdQuery } from '@/donation/application/query/get-promise-donation-by-id.query';
import { GetPromiseDonationQueryParams } from '@/donation/application/query/get-promise-donation-paginated.query';
import { DeactivatePromiseDonationCommand } from '@/donation/application/command/deactivate-promise-donation.command';
import { GetPromiseDonationWithBeneficientsQueryParams } from '@/donation/application/query/get-promise-donation-with-beneficients-paginated.query';

@Controller('promises')
export class PromiseDonationController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @Auth(PermissionNames.ADD_PROMISE_DONATION)
  async create(@Body() dto: CreatePromiseDonationDto, @GetUser() user: any) {
    return await this.commandBus.execute(
      CreatePromiseDonationCommand.fromDto(dto, user.id),
    );
  }

  @Get('/with-beneficients')
  @Auth(PermissionNames.VIEW_PROMISE_DONATION)
  async findAllWithBeneficients(@Query() query: GetPromiseDonationsQueryDto) {
    return await this.queryBus.execute(
      new GetPromiseDonationWithBeneficientsQueryParams(
        query.currency,
        query.method,
        query.recurring,
        query.recurrence,
        query.isActive,
        query.page,
        query.limit,
      ),
    );
  }

  @Get()
  @Auth(PermissionNames.VIEW_PROMISE_DONATION)
  async findAll(@Query() query: GetPromiseDonationsQueryDto) {
    return await this.queryBus.execute(
      new GetPromiseDonationQueryParams(
        query.currency,
        query.method,
        query.recurring,
        query.recurrence,
        query.isActive,
        query.page,
        query.limit,
      ),
    );
  }

  @Get(':id')
  @Auth(PermissionNames.VIEW_PROMISE_DONATION)
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return await this.queryBus.execute(new GetPromiseDonationByIdQuery(id));
  }

  @Patch(':id/deactivate')
  @Auth(PermissionNames.EDIT_PROMISE_DONATION)
  async deactivate(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body('reason') reason: string,
  ) {
    return await this.commandBus.execute(
      new DeactivatePromiseDonationCommand(id, reason),
    );
  }
}
