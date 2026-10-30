import { client } from './client.js';

const OTP_TTL = 5 * 60;
const keyFor = (userId) => `otp:${userId}`;

export async function saveOtp(userId, code) {
  await client.set(keyFor(userId), code, { EX: OTP_TTL });
}

export async function getOtp(userId) {
  return client.get(keyFor(userId));
}

export async function deleteOtp(userId) {
  await client.del(keyFor(userId));
}
