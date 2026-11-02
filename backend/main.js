import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from "cookie-parser";
import { verifyConnection as verifyMySQL, closePool, users } from './db/index.js';
import { verifyConnection as verifyRedis, closeRedis } from './redis/index.js';
import { verifyEmailConnection } from './email/mailer.js';
import authRouter from './routes/auth.js'
import profileRouter from './routes/profile.js'

const app = express();
const PORT = process.env.BACKEND_PORT;

app.use(express.json());
app.use(cookieParser())
app.use(helmet());
app.use(cors({
  origin: `http://${process.env.FRONTEND_HOST}:${process.env.FRONTEND_PORT}`
}));


app.use('/uploads', express.static("/uploads"));
app.use('/api/profile', profileRouter)
app.use('/api/auth', authRouter)
app.get('/healthz', (_, res) => {
  res.status(200).send("ok");
});

app.use((_err, _req, res, _) => {
	res.status(500).json({ error: "Internal server error" });
});


async function start() {
  await Promise.all([
    verifyMySQL().then(() => console.log("Connected to MySQL")),
    verifyRedis().then(() => console.log("Connected to Redis")),
    verifyEmailConnection().then(() => console.log("Connected to SMTP")),
  ])
  await users.ensureAdminUser();

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
  console.error('Failed to start server:', err);
  process.exit(1);
});
