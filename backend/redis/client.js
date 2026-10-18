import { createClient } from 'redis';

export const client = createClient({
  url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
});

client.on('error', (err) => {
  console.error('Redis error:', err.message);
});

export async function connectRedis() {
  if (!client.isOpen) await client.connect();
  return client;
}

export async function verifyConnection() {
  await connectRedis();
  await client.ping();
}

export async function closeRedis() {
  if (client.isOpen) await client.quit();
}
