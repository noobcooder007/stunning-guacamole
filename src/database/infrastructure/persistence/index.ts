import { TypeORMBeneficientRepository } from '@/community/infrastructure/persistence/typeorm/adapters/typeorm-beneficient.repository';
import { TypeORMChurchRepository } from '@/community/infrastructure/persistence/typeorm/adapters/typeorm-church.repository';
import { TypeORMCollectorRepository } from '@/community/infrastructure/persistence/typeorm/adapters/typeorm-collector.repository';
import { TypeORMProfileRepository } from '@/community/infrastructure/persistence/typeorm/adapters/typeorm-profile.repository';
import { TypeORMPermissionRepository } from '@/auth/infrastructure/persistence/typeorm/adapters/typeorm-permission-repository';
import { TypeORMSessionRepository } from '@/auth/infrastructure/persistence/typeorm/adapters/typeorm-session-repository';
import { TypeORMRoleRepository } from '@/auth/infrastructure/persistence/typeorm/adapters/typeorm-role-repository';
import { TypeORMUserRepository } from '@/auth/infrastructure/persistence/typeorm/adapters/typeorm-user-repository';
import { TypeORMAssignationRepository } from '@/community/infrastructure/persistence/typeorm/adapters/typeorm-assignation.repository';
import { TypeORMPromiseDonationRepository } from '@/donation/infrastructure/persistence/typeorm/adapters/typeorm-promise-donation.repository';
import { TypeORMReceiptRepository } from '@/donation/infrastructure/persistence/typeorm/adapters/typeorm-receipt.repository';
import { TypeORMReceiptSequenceRepository } from '@/donation/infrastructure/persistence/typeorm/adapters/typeorm-receipt-sequence.repository';
import { TypeORMCollectionPeriodRepository } from '@/donation/infrastructure/persistence/typeorm/adapters/typeorm-collection-period.repository';
import { TypeORMCollectorSettlementRepository } from '@/donation/infrastructure/persistence/typeorm/adapters/typeorm-collector-settlement.repository';
import { TypeORMCollectorPaymentRepository } from '@/donation/infrastructure/persistence/typeorm/adapters/typeorm-collector-payment.repository';

export const REPOSITORY_TOKENS = {
  USER: 'IUserRepository',
  ROLES: 'IRoleRepository',
  PERMISSION: 'IPermissionRepository',
  SESSION: 'ISessionRepository',
  CHURCH: 'IChurchRepository',
  COLLECTOR: 'ICollectorRepository',
  BENEFICIENT: 'IBeneficientRepository',
  PROFILE: 'IProfileRepository',
  ASSIGNATION: 'IAssignationRepository',
  PROMISE_DONATION: 'IPromiseDonationRepository',
  RECEIPT: 'IReceiptRepository',
  RECEIPT_SEQUENCE: 'IReceiptSequenceRepository',
  COLLECTION_PERIOD: 'ICollectionPeriodRepository',
  COLLECTOR_SETTLEMENT: 'ICollectorSettlementRepository',
  COLLECTOR_PAYMENT: 'ICollectorPaymentRepository',
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
    provide: REPOSITORY_TOKENS.PROFILE,
    useClass: TypeORMProfileRepository,
  },
  {
    provide: REPOSITORY_TOKENS.ASSIGNATION,
    useClass: TypeORMAssignationRepository,
  },
  {
    provide: REPOSITORY_TOKENS.PROMISE_DONATION,
    useClass: TypeORMPromiseDonationRepository,
  },
  {
    provide: REPOSITORY_TOKENS.RECEIPT,
    useClass: TypeORMReceiptRepository,
  },
  {
    provide: REPOSITORY_TOKENS.RECEIPT_SEQUENCE,
    useClass: TypeORMReceiptSequenceRepository,
  },
  {
    provide: REPOSITORY_TOKENS.COLLECTION_PERIOD,
    useClass: TypeORMCollectionPeriodRepository,
  },
  {
    provide: REPOSITORY_TOKENS.COLLECTOR_SETTLEMENT,
    useClass: TypeORMCollectorSettlementRepository,
  },
  {
    provide: REPOSITORY_TOKENS.COLLECTOR_PAYMENT,
    useClass: TypeORMCollectorPaymentRepository,
  },
];
