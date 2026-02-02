import { Inject } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';
import { SeedCommand } from '@/auth/application/commands/seed.command';
import { Result } from '@/shared/domain/dto/result.dto';
import { BaseCommandHandler } from '@/shared/application/handler/base-command.handler';
import { Permission } from '@/auth/domain/entities/permission.entity';
import { Role } from '@/auth/domain/aggregates/role.aggregate';
import { IPermissionRepository } from '@/auth/application/repositories/permission.repository';
import { IRoleRepository } from '@/auth/application/repositories/role.repository';
import { CreateUserService } from '@/auth/infrastructure/services/create-user.service';
import { REPOSITORY_TOKENS } from '@/database/infrastructure/persistence';
import { UnitOfWork } from '@/database/unit-of-work';
import { DomainException } from '@/shared/domain/exceptions/domain.exception';

@CommandHandler(SeedCommand)
export class SeedHandler extends BaseCommandHandler<SeedCommand, void> {
  constructor(
    private readonly createUserService: CreateUserService,
    @Inject(REPOSITORY_TOKENS.ROLES)
    private readonly roleRepository: IRoleRepository,
    @Inject(REPOSITORY_TOKENS.PERMISSION)
    private readonly permissionRepository: IPermissionRepository,
    private readonly uow: UnitOfWork,
  ) {
    super();
  }

  protected async process(command: SeedCommand): Promise<Result<void>> {
    await this.uow.runInTransaction(async () => {
      // TODO: Terminar de definir los permisos para cada rol y moverlo a un command handler
      const addChurchPermission = Permission.create({
        name: 'add:church',
        description: 'Añadir inglesia',
      });
      const viewChurchPermission = Permission.create({
        name: 'view:church',
        description: 'Ver inglesia',
      });
      const viewInvoicePermission = Permission.create({
        name: 'view:invoice',
        description: 'Ver recibos',
      });
      await this.permissionRepository.save([
        addChurchPermission,
        viewChurchPermission,
        viewInvoicePermission,
      ]);
      const superAdmin = Role.create({
        name: 'superadministrator',
        description: 'Rol dedicado a actividades de administración',
        permissions: new Set([addChurchPermission]),
      });
      const adminRole = Role.create({
        name: 'administrator',
        description: 'Rol dedicado a actividades de administración',
        permissions: new Set([addChurchPermission]),
      });
      const collectorRole = Role.create({
        name: 'collector',
        description: 'Rol dedicado a actividades de colector',
        permissions: new Set([viewChurchPermission]),
      });
      const beneficientRole = Role.create({
        name: 'beneficient',
        description: 'Role dedicado a actividades de bienhechor',
        permissions: new Set([viewInvoicePermission]),
      });
      await this.roleRepository.save([
        superAdmin,
        adminRole,
        collectorRole,
        beneficientRole,
      ]);
      const result = await this.createUserService.execute(command);
      if (!result.isSuccess) {
        throw new DomainException(
          result.error.message,
          result.error.entity,
          result.error.type,
        );
      }
    });
    return Result.ok<void>(undefined);
  }
}
