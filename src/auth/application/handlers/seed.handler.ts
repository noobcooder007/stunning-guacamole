import { Inject } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';
import { UnitOfWork } from '@/database/unit-of-work';
import { Result } from '@/shared/domain/dto/result.dto';
import { REPOSITORY_TOKENS } from '@/database/infrastructure/persistence';
import { DomainException } from '@/shared/domain/exceptions/domain.exception';
import { BaseCommandHandler } from '@/shared/application/handler/base-command.handler';
import { Permission } from '@/auth/domain/entities/permission.entity';
import { Role } from '@/auth/domain/aggregates/role.aggregate';
import { SeedCommand } from '@/auth/application/commands/seed.command';
import { IPermissionRepository } from '@/auth/application/repositories/permission.repository';
import { IRoleRepository } from '@/auth/application/repositories/role.repository';
import { CreateUserService } from '@/auth/infrastructure/services/create-user.service';
import { CreateUserCommand } from '@/auth/application/commands/create-user.command';
import { PermissionNames } from '@/auth/domain/constants/permissions';

const PERMISSION_DESCRIPTIONS: Record<PermissionNames, string> = {
  // Iglesias
  [PermissionNames.ADD_CHURCH]: 'Añadir iglesia',
  [PermissionNames.EDIT_CHURCH]: 'Editar iglesia',
  [PermissionNames.DELETE_CHURCH]: 'Eliminar iglesia',
  [PermissionNames.LIST_CHURCH]: 'Listar iglesias',
  [PermissionNames.VIEW_CHURCH]: 'Ver iglesia',
  // Usuarios
  [PermissionNames.ADD_USER]: 'Añadir usuario',
  [PermissionNames.EDIT_USER]: 'Editar usuario',
  [PermissionNames.DELETE_USER]: 'Eliminar usuario',
  [PermissionNames.VIEW_USER]: 'Ver usuario',
  // Roles y permisos
  [PermissionNames.ADD_ROLE]: 'Añadir rol',
  [PermissionNames.EDIT_ROLE]: 'Editar rol',
  [PermissionNames.DELETE_ROLE]: 'Eliminar rol',
  [PermissionNames.VIEW_ROLE]: 'Ver rol',
  [PermissionNames.ADD_PERMISSION]: 'Añadir permiso',
  [PermissionNames.EDIT_PERMISSION]: 'Editar permiso',
  [PermissionNames.DELETE_PERMISSION]: 'Eliminar permiso',
  [PermissionNames.VIEW_PERMISSION]: 'Ver permiso',
  // Colectores
  [PermissionNames.ADD_COLLECTOR]: 'Añadir colector',
  [PermissionNames.EDIT_COLLECTOR]: 'Editar colector',
  [PermissionNames.DELETE_COLLECTOR]: 'Eliminar colector',
  [PermissionNames.VIEW_COLLECTOR]: 'Ver colector',
  // Bienhechores
  [PermissionNames.ADD_BENEFICIENT]: 'Añadir bienhechor',
  [PermissionNames.EDIT_BENEFICIENT]: 'Editar bienhechor',
  [PermissionNames.DELETE_BENEFICIENT]: 'Eliminar bienhechor',
  [PermissionNames.VIEW_BENEFICIENT]: 'Ver bienhechor',
  // Promesas de donación
  [PermissionNames.ADD_PROMISE_DONATION]: 'Añadir promesa de donación',
  [PermissionNames.EDIT_PROMISE_DONATION]: 'Editar promesa de donación',
  [PermissionNames.DELETE_PROMISE_DONATION]: 'Eliminar promesa de donación',
  [PermissionNames.VIEW_PROMISE_DONATION]: 'Ver promesa de donación',
  // Recibos
  [PermissionNames.ADD_INVOICE]: 'Generar recibo',
  [PermissionNames.EDIT_INVOICE]: 'Editar recibo',
  [PermissionNames.DELETE_INVOICE]: 'Eliminar recibo',
  [PermissionNames.VIEW_INVOICE]: 'Ver recibo',
  // Pagos
  [PermissionNames.ADD_PAYMENT]: 'Añadir pago',
  [PermissionNames.EDIT_PAYMENT]: 'Editar pago',
  [PermissionNames.DELETE_PAYMENT]: 'Eliminar pago',
  [PermissionNames.VIEW_PAYMENT]: 'Ver pago',
  // Donaciones
  [PermissionNames.ADD_DONATION]: 'Añadir donación',
  [PermissionNames.EDIT_DONATION]: 'Editar donación',
  [PermissionNames.DELETE_DONATION]: 'Eliminar donación',
  [PermissionNames.VIEW_DONATION]: 'Ver donación',
};

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
      const permissionMap = this.buildPermissionMap();
      const allPermissions = Object.values(permissionMap);
      await this.permissionRepository.save(allPermissions);

      const p = permissionMap;

      const superAdmin = Role.create({
        name: 'superadministrator',
        description: 'Acceso total al sistema',
        permissions: new Set(allPermissions),
      });

      const adminRole = Role.create({
        name: 'administrator',
        description:
          'Gestión completa de iglesias, colectores, bienhechores y donaciones',
        permissions: new Set([
          p[PermissionNames.ADD_CHURCH],
          p[PermissionNames.EDIT_CHURCH],
          p[PermissionNames.LIST_CHURCH],
          p[PermissionNames.VIEW_CHURCH],
          p[PermissionNames.ADD_USER],
          p[PermissionNames.EDIT_USER],
          p[PermissionNames.VIEW_USER],
          p[PermissionNames.VIEW_ROLE],
          p[PermissionNames.EDIT_ROLE],
          p[PermissionNames.VIEW_PERMISSION],
          p[PermissionNames.EDIT_PERMISSION],
          p[PermissionNames.ADD_COLLECTOR],
          p[PermissionNames.EDIT_COLLECTOR],
          p[PermissionNames.VIEW_COLLECTOR],
          p[PermissionNames.ADD_BENEFICIENT],
          p[PermissionNames.EDIT_BENEFICIENT],
          p[PermissionNames.VIEW_BENEFICIENT],
          p[PermissionNames.ADD_PROMISE_DONATION],
          p[PermissionNames.EDIT_PROMISE_DONATION],
          p[PermissionNames.VIEW_PROMISE_DONATION],
          p[PermissionNames.ADD_INVOICE],
          p[PermissionNames.EDIT_INVOICE],
          p[PermissionNames.VIEW_INVOICE],
          p[PermissionNames.VIEW_PAYMENT],
          p[PermissionNames.VIEW_DONATION],
        ]),
      });

      const collectorRole = Role.create({
        name: 'collector',
        description:
          'Generación e impresión de recibos para bienhechores asignados',
        permissions: new Set([
          p[PermissionNames.VIEW_CHURCH],
          p[PermissionNames.VIEW_COLLECTOR],
          p[PermissionNames.VIEW_BENEFICIENT],
          p[PermissionNames.VIEW_PROMISE_DONATION],
          p[PermissionNames.ADD_INVOICE],
          p[PermissionNames.EDIT_INVOICE],
          p[PermissionNames.VIEW_INVOICE],
        ]),
      });

      const beneficientRole = Role.create({
        name: 'beneficient',
        description: 'Consulta de recibos y promesas de donación propias',
        permissions: new Set([
          p[PermissionNames.VIEW_INVOICE],
          p[PermissionNames.VIEW_PROMISE_DONATION],
        ]),
      });

      await this.roleRepository.save([
        superAdmin,
        adminRole,
        collectorRole,
        beneficientRole,
      ]);

      const result = await this.createUserService.execute(
        new CreateUserCommand(
          command.username,
          command.password,
          'superadministrator',
        ),
      );
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

  private buildPermissionMap(): Record<PermissionNames, Permission> {
    return Object.fromEntries(
      Object.values(PermissionNames).map((name) => [
        name,
        Permission.create({ name, description: PERMISSION_DESCRIPTIONS[name] }),
      ]),
    ) as Record<PermissionNames, Permission>;
  }
}
