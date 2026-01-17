import { BeneficientRepositoryAdapter } from '@/people/infrastructure/persistence/beneficient.repository.adapter';
import { ChurchRepositoryAdapater } from '@/people/infrastructure/persistence/church.repository.adapter';
import { CollectorRepositoryAdapter } from '@/people/infrastructure/persistence/collector.repository.adapter';
import { ParticipantRespositoryAdapter } from '@/people/infrastructure/persistence/participant.repository.adapter';
import { TypeORMPermissionRepository } from '@/auth/infrastructure/persistence/typeorm/adapters/typeorm-permission-repository';
import { TypeORMSessionRepository } from '@/auth/infrastructure/persistence/typeorm/adapters/typeorm-session-repository';
import { TypeORMRoleRepository } from '@/auth/infrastructure/persistence/typeorm/adapters/typeorm-role-repository';
import { TypeORMUserRepository } from '@/auth/infrastructure/persistence/typeorm/adapters/typeorm-user-repository';

export const REPOSITORY_TOKENS = {
  USER: 'UserRepository',
  ROLES: 'RoleRepository',
  PERMISSION: 'PermissionRepository',
  SESSION: 'SessionRepository',
  CHURCH: 'ChurchRepository',
  COLLECTOR: 'CollectorRepository',
  BENEFICIENT: 'BeneficientRepository',
  PARTICIPANT: 'ParticipantRepository',
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
    useClass: ChurchRepositoryAdapater,
  },
  {
    provide: REPOSITORY_TOKENS.COLLECTOR,
    useClass: CollectorRepositoryAdapter,
  },
  {
    provide: REPOSITORY_TOKENS.BENEFICIENT,
    useClass: BeneficientRepositoryAdapter,
  },
  {
    provide: REPOSITORY_TOKENS.PARTICIPANT,
    useClass: ParticipantRespositoryAdapter,
  },
];
