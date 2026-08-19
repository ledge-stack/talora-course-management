import { SignJWT, jwtVerify } from 'jose';
import type { UserScope } from './index';

// In production, this should be a secure random string provided via environment variables.
// It MUST be the same secret used by the Next.js app to sign and verify.
const getSecretKey = () => {
  const secret = process.env.JWT_SECRET || 'talora-super-secret-development-key-change-me';
  return new TextEncoder().encode(secret);
};

export async function signJwt(payload: UserScope, expiresIn: string | number = '24h'): Promise<string> {
  const alg = 'HS256';
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(getSecretKey());
}

export async function verifyJwt(token: string): Promise<UserScope> {
  const { payload } = await jwtVerify(token, getSecretKey());
  return payload as unknown as UserScope;
}
