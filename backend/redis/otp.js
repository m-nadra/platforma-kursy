import { client } from './client.js';

const OTP_TTL = 5 * 60;
export const MAX_OTP_ATTEMPTS = 5;

const codeKey = (userId) => `otp:${userId}`;
const attemptsKey = (userId) => `otp_attempts:${userId}`;

export async function saveOtp(userId, code) {
  await client
    .multi()
    .set(codeKey(userId), code, { EX: OTP_TTL })
    .del(attemptsKey(userId))
    .exec();
}

export async function deleteOtp(userId) {
  return client.del([codeKey(userId), attemptsKey(userId)]);
}

const VERIFY_SCRIPT = `
local stored = redis.call('GET', KEYS[1])
if not stored then return 0 end

local attempts = redis.call('INCR', KEYS[2])
if attempts == 1 then redis.call('EXPIRE', KEYS[2], ARGV[3]) end

if attempts > tonumber(ARGV[2]) then
  redis.call('DEL', KEYS[1], KEYS[2])
  return -1
end

if stored == ARGV[1] then
  redis.call('DEL', KEYS[1], KEYS[2])
  return 1
end
return 0
`;

export async function verifyAndConsumeOtp(userId, code) {
  return client.eval(VERIFY_SCRIPT, {
    keys: [codeKey(userId), attemptsKey(userId)],
    arguments: [code, String(MAX_OTP_ATTEMPTS), String(OTP_TTL)],
  });
}