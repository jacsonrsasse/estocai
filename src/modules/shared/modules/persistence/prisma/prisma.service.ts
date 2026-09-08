import { Injectable } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { EnvService } from '#shared-modules/env/env.service';
import { PrismaClient } from '#prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor(private readonly envService: EnvService) {
    const adapter = new PrismaPg({
      connectionString: envService.get('database.url'),
    });
    super({ adapter });
  }
}
