import { randomInt } from 'node:crypto';

const ALPHANUMERIC_CHARS =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const TEMPORARY_PASSWORD_LENGTH = 5;

export function generateTemporaryPassword(): string {
  let password = '';
  for (let i = 0; i < TEMPORARY_PASSWORD_LENGTH; i++) {
    password += ALPHANUMERIC_CHARS[randomInt(ALPHANUMERIC_CHARS.length)];
  }
  return password;
}
