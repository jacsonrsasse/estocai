import { IdentityModule } from '#modules/identity/identity.module';
import { PasswordHashingService } from '#shared-modules/password-hashing/password-hashing.service';
import { createNestApp } from '#test/test-e2e.setup';
import { testDbClient } from '#test/knex.database';
import { resetDatabase } from '#test/reset-database';
import { Tables } from '#test/tables';
import { INestApplication } from '@nestjs/common';
import { v7 as uuid } from 'uuid';
import request from 'supertest';

describe('POST /auth/login (e2e)', () => {
  let app: INestApplication;
  let passwordHashingService: PasswordHashingService;

  beforeAll(async () => {
    ({ app } = await createNestApp([IdentityModule]));
    passwordHashingService = app.get(PasswordHashingService);
  });

  afterEach(async () => {
    await resetDatabase();
  });

  afterAll(async () => {
    await app.close();
    await testDbClient.destroy();
  });

  const seedUser = async (
    overrides: { status?: string; password?: string } = {},
  ) => {
    const userId = uuid();
    const password = overrides.password ?? 'correct-password';
    const passwordHash = await passwordHashingService.hash(password);

    const now = new Date();

    await testDbClient(Tables.Users).insert({
      user_id: userId,
      first_name: 'John',
      last_name: 'Doe',
      status: overrides.status ?? 'active',
      created_at: now,
      updated_at: now,
    });
    await testDbClient(Tables.UserIdentifiers).insert({
      user_identifier_id: uuid(),
      user_id: userId,
      type: 'email',
      identifier: 'john.doe@example.com',
      created_at: now,
      updated_at: now,
    });
    await testDbClient(Tables.PasswordCredentials).insert({
      password_credential_id: uuid(),
      user_id: userId,
      password_hash: passwordHash,
      created_at: now,
      updated_at: now,
    });

    return { userId, password };
  };

  it('returns an access token for valid credentials', async () => {
    const { password } = await seedUser();

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        loginType: 'email',
        email: 'john.doe@example.com',
        password,
      })
      .expect(200);

    expect(response.body).toEqual({
      accessToken: expect.any(String),
    });
  });

  it('rejects an unknown identifier', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        loginType: 'email',
        email: 'unknown@example.com',
        password: 'whatever',
      })
      .expect(401);

    expect(response.body).toMatchObject({ code: 'invalid_credentials' });
  });

  it('rejects a wrong password', async () => {
    await seedUser();

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        loginType: 'email',
        email: 'john.doe@example.com',
        password: 'wrong-password',
      })
      .expect(401);

    expect(response.body).toMatchObject({ code: 'invalid_credentials' });
  });

  it('rejects a deleted user', async () => {
    const { password } = await seedUser({ status: 'deleted' });

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        loginType: 'email',
        email: 'john.doe@example.com',
        password,
      })
      .expect(401);

    expect(response.body).toMatchObject({ code: 'invalid_credentials' });
  });

  it('rejects a payload missing the required identifier for the loginType', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ loginType: 'email', password: 'whatever' })
      .expect(400);
  });
});
