import { UserManagementModule } from '#modules/user-management/user-management.module';
import { createNestApp } from '#test/test-e2e.setup';
import { testDbClient } from '#test/knex.database';
import { resetDatabase } from '#test/reset-database';
import { Tables } from '#test/tables';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';

describe('POST /users (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    ({ app } = await createNestApp([UserManagementModule]));
  });

  afterEach(async () => {
    await resetDatabase();
  });

  afterAll(async () => {
    await app.close();
    await testDbClient.destroy();
  });

  it('creates a user and persists it as active', async () => {
    const response = await request(app.getHttpServer())
      .post('/users')
      .send({ firstName: 'John', lastName: 'Doe' })
      .expect(200);

    expect(response.body).toEqual({ userId: expect.any(String) });

    const created = await testDbClient(Tables.Users)
      .where({ user_id: response.body.userId })
      .first();

    expect(created).toMatchObject({
      firstName: 'John',
      lastName: 'Doe',
      status: 'active',
    });
  });

  it('rejects a payload with an invalid firstName', async () => {
    await request(app.getHttpServer())
      .post('/users')
      .send({ firstName: 'Jo' })
      .expect(400);
  });
});
