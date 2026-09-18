import { UserModel, UserStatus } from '#modules/identity/core/model/user.model';
import { UserManagementModule } from '#modules/identity/user-management.module';
import { createNestApp } from '#test/test-e2e.setup';
import { testDbClient } from '#test/knex.database';
import { resetDatabase } from '#test/reset-database';
import { Tables } from '#test/tables';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';

describe('DELETE /users/:userId (e2e)', () => {
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

  async function insertUser(overrides: Partial<UserModel> = {}) {
    const user = UserModel.create({ firstName: 'Jane', lastName: 'Doe' });
    const data = { ...user, ...overrides };

    await testDbClient(Tables.Users).insert({
      user_id: data.userId,
      firstName: data.firstName,
      lastName: data.lastName,
      status: data.status,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      deletedAt: data.deletedAt,
    });

    return data;
  }

  it('soft deletes an existing active user', async () => {
    const user = await insertUser();

    await request(app.getHttpServer())
      .delete(`/users/${user.userId}`)
      .expect(204);

    const updated = await testDbClient(Tables.Users)
      .where({ user_id: user.userId })
      .first();

    expect(updated.status).toBe('deleted');
    expect(updated.deletedAt).not.toBeNull();
  });

  it('returns success when the user is already deleted', async () => {
    const user = await insertUser({
      status: UserStatus.deleted,
      deletedAt: new Date(),
    });

    await request(app.getHttpServer())
      .delete(`/users/${user.userId}`)
      .expect(204);
  });

  it('returns 404 when the user does not exist', async () => {
    await request(app.getHttpServer())
      .delete('/users/00000000-0000-0000-0000-000000000000')
      .expect(404);
  });
});
