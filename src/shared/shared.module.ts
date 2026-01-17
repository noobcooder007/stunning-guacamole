import { Module } from '@nestjs/common';
import { BcryptHasher } from './infrastructure/security/bcrypt.hasher';
import { TokenHasher } from './infrastructure/security/safe-compare';

@Module({
  providers: [
    {
      provide: 'IPasswordHasher',
      useClass: BcryptHasher,
    },
    {
      provide: 'ITokenHasher',
      useClass: TokenHasher,
    },
  ],
  exports: ['IPasswordHasher', 'ITokenHasher'],
})
export class SharedModule {}
