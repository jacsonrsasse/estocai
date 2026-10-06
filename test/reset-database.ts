import { testDbClient } from '#test/knex.database';
import { Tables } from '#test/tables';

export async function resetDatabase(): Promise<void> {
  await testDbClient(Tables.UserIdentifiers).delete();
  await testDbClient(Tables.PasswordCredentials).delete();
  await testDbClient(Tables.OAuthCredentials).delete();
  await testDbClient(Tables.Users).delete();
}
