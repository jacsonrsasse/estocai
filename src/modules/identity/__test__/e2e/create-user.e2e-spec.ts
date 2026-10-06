import { IdentityModule } from '#modules/identity/identity.module';
import { PasswordHashingService } from '#shared-modules/password-hashing/password-hashing.service';
import { createNestApp } from '#test/test-e2e.setup';
import { testDbClient } from '#test/knex.database';
import { resetDatabase } from '#test/reset-database';
import { Tables } from '#test/tables';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';

describe('POST /users (e2e)', () => {
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

  it('creates a user with an email identifier and a password credential', async () => {
    const response = await request(app.getHttpServer())
      .post('/users')
      .send({
        loginType: 'email',
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
      })
      .expect(200);

    expect(response.body).toEqual({
      loginType: 'email',
      identity: 'john.doe@example.com',
      temporaryPassword: expect.stringMatching(/^[A-Za-z0-9]{5}$/),
    });

    const createdIdentifier = await testDbClient(Tables.UserIdentifiers)
      .where({ identifier: 'john.doe@example.com' })
      .first();
    expect(createdIdentifier).toMatchObject({
      type: 'email',
      identifier: 'john.doe@example.com',
    });

    const createdUser = await testDbClient(Tables.Users)
      .where({ user_id: createdIdentifier.user_id })
      .first();
    expect(createdUser).toMatchObject({
      first_name: 'John',
      last_name: 'Doe',
      status: 'active',
    });

    const createdCredential = await testDbClient(Tables.PasswordCredentials)
      .where({ user_id: createdIdentifier.user_id })
      .first();
    expect(createdCredential.password_hash).not.toBe(
      response.body.temporaryPassword,
    );
    await expect(
      passwordHashingService.verify(
        response.body.temporaryPassword,
        createdCredential.password_hash,
      ),
    ).resolves.toBe(true);
  });

  it('creates a user with a username identifier', async () => {
    const response = await request(app.getHttpServer())
      .post('/users')
      .send({
        loginType: 'username',
        username: 'johndoe',
        firstName: 'John',
      })
      .expect(200);

    expect(response.body).toMatchObject({
      loginType: 'username',
      identity: 'johndoe',
    });

    const createdIdentifier = await testDbClient(Tables.UserIdentifiers)
      .where({ identifier: 'johndoe' })
      .first();
    expect(createdIdentifier).toMatchObject({
      type: 'username',
      identifier: 'johndoe',
    });
  });

  it('rejects a payload with an invalid firstName', async () => {
    await request(app.getHttpServer())
      .post('/users')
      .send({ loginType: 'email', email: 'john.doe@example.com', firstName: 'Jo' })
      .expect(400);
  });

  it('rejects an email loginType without an email', async () => {
    await request(app.getHttpServer())
      .post('/users')
      .send({ loginType: 'email', firstName: 'John' })
      .expect(400);
  });

  it('rejects a username loginType without a username', async () => {
    await request(app.getHttpServer())
      .post('/users')
      .send({ loginType: 'username', firstName: 'John' })
      .expect(400);
  });

});
