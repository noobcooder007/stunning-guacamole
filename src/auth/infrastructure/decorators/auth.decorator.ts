import { applyDecorators, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  PermitProtected,
  ValidPermitions,
} from '@/auth/infrastructure/decorators/permit-protected.decorator';
import { UserPermitGuard } from '@/auth/infrastructure/guards/user-permit.guard';

export function Auth(...roles: ValidPermitions[]) {
  return applyDecorators(
    PermitProtected(...roles),
    UseGuards(AuthGuard(), UserPermitGuard),
  );
}
