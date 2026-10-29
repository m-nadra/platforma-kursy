import { client } from './client.js';

const REFRESH_TOKEN_TTL = 7 * 24 * 3600;
const keyFor = (userId) => `refresh_token:${userId}`;

export async function saveRefreshToken(userId, token) {
  await client.set(keyFor(userId), token, { EX: REFRESH_TOKEN_TTL });
}

export async function getRefreshToken(userId) {
  return client.get(keyFor(userId));
}

export async function deleteRefreshToken(userId) {
  await client.del(keyFor(userId));
}
