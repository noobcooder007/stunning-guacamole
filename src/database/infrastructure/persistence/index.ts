import { BeneficientRepositoryAdapter } from '@/people/infrastructure/persistence/beneficient.repository.adapter';
import { ChurchRepositoryAdapater } from '@/people/infrastructure/persistence/church.repository.adapter';
import { CollectorRepositoryAdapter } from '@/people/infrastructure/persistence/collector.repository.adapter';
import { ParticipantRespositoryAdapter } from '@/people/infrastructure/persistence/participant.repository.adapter';
import { PermissionRepositoryAdapter } from '@/auth/infrastructure/persistence/permission.repository.adapter';
import { sessionRepositoryAdapter } from '@/auth/infrastructure/persistence/session.repository.adapter';
import { RoleRepositoryAdapter } from '@/auth/infrastructure/persistence/role.repository.adapter';
import { UserRepositoryAdapter } from '@/auth/infrastructure/persistence/user.repository.adapter';

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
    useClass: UserRepositoryAdapter,
  },
  {
    provide: REPOSITORY_TOKENS.ROLES,
    useClass: RoleRepositoryAdapter,
  },
  {
    provide: REPOSITORY_TOKENS.PERMISSION,
    useClass: PermissionRepositoryAdapter,
  },
  {
    provide: REPOSITORY_TOKENS.SESSION,
    useClass: sessionRepositoryAdapter,
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
