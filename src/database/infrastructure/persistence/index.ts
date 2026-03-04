import { TypeORMBeneficientRepository } from '@/community/infrastructure/persistence/typeorm/adapters/typeorm-beneficient.repository';
import { TypeORMChurchRepository } from '@/community/infrastructure/persistence/typeorm/adapters/typeorm-church.repository';
import { TypeORMCollectorRepository } from '@/community/infrastructure/persistence/typeorm/adapters/typeorm-collector.repository';
import { TypeORMPermissionRepository } from '@/auth/infrastructure/persistence/typeorm/adapters/typeorm-permission-repository';
import { TypeORMSessionRepository } from '@/auth/infrastructure/persistence/typeorm/adapters/typeorm-session-repository';
import { TypeORMRoleRepository } from '@/auth/infrastructure/persistence/typeorm/adapters/typeorm-role-repository';
import { TypeORMUserRepository } from '@/auth/infrastructure/persistence/typeorm/adapters/typeorm-user-repository';
import { TypeORMAssignationRepository } from '@/community/infrastructure/persistence/typeorm/adapters/typeorm-assignation.repository';
import { TypeORMPromiseDonationRepository } from '@/donation/infrastructure/persistence/typeorm/adapters/typeorm-promise-donation.repository';

export const REPOSITORY_TOKENS = {
  USER: 'IUserRepository',
  ROLES: 'IRoleRepository',
  PERMISSION: 'IPermissionRepository',
  SESSION: 'ISessionRepository',
  CHURCH: 'IChurchRepository',
  COLLECTOR: 'ICollectorRepository',
  BENEFICIENT: 'IBeneficientRepository',
  ASSIGNATION: 'IAssignationRepository',
  PROMISE_DONATION: 'IPromiseDonationRepository',
  RECEIPT: 'IReceiptRepository',
};

export const DATABASE_REPOSITORIES = [
  {
    provide: REPOSITORY_TOKENS.USER,
    useClass: TypeORMUserRepository,
  },
  {
    provide: REPOSITORY_TOKENS.ROLES,
    useClass: TypeORMRoleRepository,
  },
  {
    provide: REPOSITORY_TOKENS.PERMISSION,
    useClass: TypeORMPermissionRepository,
  },
  {
    provide: REPOSITORY_TOKENS.SESSION,
    useClass: TypeORMSessionRepository,
  },
  {
    provide: REPOSITORY_TOKENS.CHURCH,
    useClass: TypeORMChurchRepository,
  },
  {
    provide: REPOSITORY_TOKENS.COLLECTOR,
    useClass: TypeORMCollectorRepository,
  },
  {
    provide: REPOSITORY_TOKENS.BENEFICIENT,
    useClass: TypeORMBeneficientRepository,
  },
  {
    provide: REPOSITORY_TOKENS.ASSIGNATION,
    useClass: TypeORMAssignationRepository,
  },
  {
    provide: REPOSITORY_TOKENS.PROMISE_DONATION,
    useClass: TypeORMPromiseDonationRepository,
  },
  // {
  //   provide: REPOSITORY_TOKENS.RECEIPT,
  //   useClass: TypeORMReceiptRepository,
  // },
];
