import { PartialType } from '@nestjs/mapped-types';
import { CreateChurchDto } from '@/people/infrastructure/dto/create-church.dto';

export class UpdateChurchDto extends PartialType(CreateChurchDto) {}
