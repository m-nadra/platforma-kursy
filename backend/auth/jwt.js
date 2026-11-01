import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET.length < 32) {
	throw new Error('JWT_SECRET must be set and at least 32 characters long');
}

const ALGORITHM = 'HS256';

export const REFRESH_TTL_SECONDS = 7 * 24 * 3600;
export const REFRESH_TTL_MS = REFRESH_TTL_SECONDS * 1000;

const sign = (payload, type, expiresIn) =>
	jwt.sign({ ...payload, type }, JWT_SECRET, { algorithm: ALGORITHM, expiresIn });

export const generateAccessToken = (payload) => sign(payload, 'access', '5m');
export const generateRefreshToken = (id, sid) => sign({ id, sid }, 'refresh', REFRESH_TTL_SECONDS);
export const generateOtpToken = (id) => sign({ id }, 'otp', '5m');

export function verifyToken(token, type) {
	const payload = jwt.verify(token, JWT_SECRET, { algorithms: [ALGORITHM] });
	if (payload.type !== type) {
		throw new jwt.JsonWebTokenError('Invalid token type');
	}
	return payload;
}

export function tryVerifyToken(token, type) {
	if (typeof token !== 'string') return null;
	try {
		return verifyToken(token, type);
	} catch {
		return null;
	}
}