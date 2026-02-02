import { PartialType } from '@nestjs/mapped-types';
import { CreateBeneficientCommand } from './create-beneficient.command';

export class UpdateBeneficientCommand extends PartialType(
  CreateBeneficientCommand,
) {}
