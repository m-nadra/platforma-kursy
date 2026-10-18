import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from "cookie-parser";
import { verifyConnection as verifyMySQL, closePool } from './db/index.js';
import { verifyConnection as verifyRedis, closeRedis } from './redis/index.js';

const app = express();
const PORT = process.env.BACKEND_PORT;

app.use(express.json());
app.use(cookieParser())
app.use(helmet());
app.use(cors({
  origin: `http://${process.env.FRONTEND_HOST}:${process.env.FRONTEND_PORT}`
}));


app.use('/uploads', express.static("/uploads"));
app.get('/healthz', (_, res) => {
  res.status(200).send("ok");
});


async function start() {
  await verifyMySQL();
  console.log('Connected to MySQL');

  await verifyRedis();
  console.log('Connected to Redis');

  const server = app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });

  const shutdown = async (signal) => {
    console.log(`${signal} received, shutting down`);
    server.close(async () => {
      await closePool();
      await closeRedis();
      process.exit(0);
    });
  };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}
start().catch((err) => {
  console.error('Failed to start server:', err.message);
  process.exit(1);
});
