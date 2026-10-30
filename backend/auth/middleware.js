import { verifyToken } from './jwt.js';
import { getUserById } from '../db/users.js';

export async function requireAuth(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Brak autoryzacji' });
  }

  const token = header.slice('Bearer '.length).trim();

  let payload;
  try {
    payload = verifyToken(token);
  } catch {
    return res.status(401).json({ error: 'Sesja wygasła' });
  }

  if (payload.type !== 'access' || !payload.id) {
    return res.status(401).json({ error: 'Nieprawidłowy token' });
  }

  const user = await getUserById(payload.id);
  if (!user) {
    return res.status(401).json({ error: 'Sesja wygasła' });
  }

  req.user = user;
  next();
}
