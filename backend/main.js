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
  await verifyMySQL();
  console.log('Connected to MySQL');

  const adminPassword = process.env.ADMIN_USER_PASSWORD;
  const adminEmail = process.env.ADMIN_EMAIL;
  if (adminPassword && adminEmail) {
    const created = await users.ensureAdminUser(adminPassword, adminEmail);
    console.log(created ? 'Created admin user' : 'Admin user already exists');
  } else {
    console.warn('ADMIN_USER_PASSWORD or ADMIN_EMAIL not set, skipping admin user creation');
  }

  await verifyRedis();
  console.log('Connected to Redis');

  if (process.env.SMTP_HOST) {
    await verifyEmailConnection();
    console.log('Connected to SMTP');
  } else {
    console.warn('SMTP_HOST not set, skipping email verification');
  }

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
