import { EnvService } from '#shared-modules/env/env.service';
import { Injectable } from '@nestjs/common';
import { argon2id, hash, verify } from 'argon2';

const ARGON2_MEMORY_COST = 65536;
const ARGON2_TIME_COST = 3;
const ARGON2_PARALLELISM = 4;

@Injectable()
export class PasswordHashingService {
  constructor(private readonly envService: EnvService) {}

  async hash(plainPassword: string): Promise<string> {
    return hash(this.withPepper(plainPassword), {
      type: argon2id,
      memoryCost: ARGON2_MEMORY_COST,
      timeCost: ARGON2_TIME_COST,
      parallelism: ARGON2_PARALLELISM,
    });
  }

  async verify(plainPassword: string, hash: string): Promise<boolean> {
    return verify(hash, this.withPepper(plainPassword));
  }

  private withPepper(plainPassword: string): string {
    return plainPassword + this.envService.get('security.passwordPepper');
  }
}
