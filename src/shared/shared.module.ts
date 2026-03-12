import { Module } from '@nestjs/common';
import { BcryptHasher } from '@/shared/infrastructure/security/bcrypt.hasher';
import { TokenHasher } from '@/shared/infrastructure/security/token-hasher';
import { EncryptionService } from '@/shared/infrastructure/services/encryption.service';
import { PDFService } from '@/shared/application/service/pdf.service';

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
    {
      provide: 'IPrinterService',
      useClass: PDFService,
    },
    EncryptionService,
  ],
  exports: [
    'IPasswordHasher',
    'ITokenHasher',
    'IBlindIndexHasher',
    'IPrinterService',
    EncryptionService,
  ],
})
export class SharedModule {}
