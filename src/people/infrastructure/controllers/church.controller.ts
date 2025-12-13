import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
} from '@nestjs/common';
import { ChurchService } from '@/people/domain/services/church.service';
import { Auth } from '@/auth/infrastructure/decorators/auth.decorator';
import { ValidPermitions } from '@/auth/infrastructure/decorators/permit-protected.decorator';
import { CreateChurchDto } from '../dto/create-church.dto';
import { UpdateChurchDto } from '../dto/update-church.dto';
import { PaginationDto } from '@/shared/dto/pagination.dto';

@Controller('church')
export class ChurchController {
  constructor(private readonly churchService: ChurchService) {}

  @Auth(ValidPermitions.ADD_CHURCH)
  @Post()
  create(@Body() church: CreateChurchDto) {
    return this.churchService.create(church);
  }

  @Auth(ValidPermitions.EDIT_CHURCH)
  @Put(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() church: UpdateChurchDto,
  ) {
    return this.churchService.update(id, church);
  }

  @Get()
  findAll(@Body() paginationDto: PaginationDto) {
    return this.churchService.findAll(paginationDto);
  }
}
