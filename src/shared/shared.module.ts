import { Module } from '@nestjs/common';
import { BcryptHasher } from '@/shared/infrastructure/security/bcrypt.hasher';
import { TokenHasher } from '@/shared/infrastructure/security/token-hasher';
import { EncryptionService } from '@/shared/infrastructure/services/encryption.service';

@Module({
  providers: [
    TokenHasher,
    {
      provide: 'IPasswordHasher',
      useClass: BcryptHasher,
    },
    {
      provide: 'ITokenHasher',
      useClass: TokenHasher,
    },
    {
      provide: 'IBlindIndexHasher',
      useClass: TokenHasher,
    },
    EncryptionService,
  ],
  exports: [
    'IPasswordHasher',
    'ITokenHasher',
    'IBlindIndexHasher',
    EncryptionService,
  ],
})
export class SharedModule {}
