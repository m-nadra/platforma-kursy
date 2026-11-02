import { createHash, randomUUID } from 'node:crypto';
import { client } from './client.js';
import { REFRESH_TTL_SECONDS } from '../auth/jwt.js';

const sessionKey = (userId, sid) => `refresh:${userId}:${sid}`;
const userSessionsKey = (userId) => `sessions:${userId}`;

export const newSessionId = () => randomUUID();
export const hashToken = (token) => createHash('sha256').update(token).digest('hex');

export async function saveRefreshToken(userId, sid, token) {
  await client
    .multi()
    .set(sessionKey(userId, sid), hashToken(token), { EX: REFRESH_TTL_SECONDS })
    .sAdd(userSessionsKey(userId), sid)
    .expire(userSessionsKey(userId), REFRESH_TTL_SECONDS)
    .exec();
}

export async function isRefreshTokenValid(userId, sid, token) {
  const stored = await client.get(sessionKey(userId, sid));
  return stored !== null && stored === hashToken(token);
}

export async function deleteSession(userId, sid) {
  await client.multi()
    .del(sessionKey(userId, sid))
    .sRem(userSessionsKey(userId), sid)
    .exec();
}

export async function deleteAllSessions(userId) {
  const sids = await client.sMembers(userSessionsKey(userId));
  const keys = sids.map((sid) => sessionKey(userId, sid));
  await client.del([...keys, userSessionsKey(userId)]);
}