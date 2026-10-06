import { PasswordHashingService } from '#shared-modules/password-hashing/password-hashing.service';
import { Global, Module } from '@nestjs/common';

@Global()
@Module({
  providers: [PasswordHashingService],
  exports: [PasswordHashingService],
})
export class PasswordHashingModule {}
