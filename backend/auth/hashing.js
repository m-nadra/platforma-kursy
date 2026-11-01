import argon2 from 'argon2';

const ARGON2_OPTIONS = {
	type: argon2.argon2id,
	memoryCost: 19456,
	timeCost: 2,
	parallelism: 1,
};

export const hashPassword = (password) => argon2.hash(password, ARGON2_OPTIONS);

let dummyHash;

export async function verifyPassword(hash, password) {
	dummyHash ??= await hashPassword('dummy-password-for-timing');
	try {
		const ok = await argon2.verify(hash ?? dummyHash, password);
		return ok && Boolean(hash);
	} catch (err) {
		console.error('Password verification failed:', err.message);
		return false;
	}
}

export const needsRehash = (hash) => argon2.needsRehash(hash, ARGON2_OPTIONS);