import { verifyToken } from './jwt.js';
import { getRefreshToken } from '../redis/index.js';
import { getUserById } from '../db/users.js';

export async function requireAuth(req, res, next) {
  const token = req.cookies.refresh_token;

  if (!token) {
    return res.status(401).json({ error: 'Brak autoryzacji' });
  }

  let payload;
  try {
    payload = verifyToken(token);
  } catch {
    return res.status(401).json({ error: 'Sesja wygasła' });
  }

  const storedToken = await getRefreshToken(payload.id);
  if (!storedToken || storedToken !== token) {
    return res.status(401).json({ error: 'Sesja wygasła' });
  }

  const user = await getUserById(payload.id);
  if (!user) {
    return res.status(401).json({ error: 'Sesja wygasła' });
  }

  req.user = user;
  next();
}
