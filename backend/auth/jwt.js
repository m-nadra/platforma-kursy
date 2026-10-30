import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
	throw new Error('JWT_SECRET environment variable is not set');
}

export function generateAccessToken(payload) {
	return jwt.sign(payload, JWT_SECRET, { expiresIn: '5m' });
}

export function generateRefreshToken(user_id) {
	return jwt.sign({id: user_id}, JWT_SECRET, { expiresIn: '7d' });
}

export function generateOtpToken(user_id) {
	return jwt.sign({id: user_id, purpose: 'otp'}, JWT_SECRET, { expiresIn: '5m' });
}

export function verifyToken(token) {
	return jwt.verify(token, JWT_SECRET);
}
