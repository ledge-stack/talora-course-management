/**
 * Lightweight Firebase ID token verifier using jose v4.
 * 
 * Replaces firebase-admin to avoid the ERR_REQUIRE_ESM crash caused by
 * firebase-admin's jwks-rsa dependency trying to require() jose v6 (ESM-only).
 *
 * Firebase ID tokens are standard RS256 JWTs. We verify them using Google's
 * public JWKS endpoint, exactly as firebase-admin does internally.
 */
import { createRemoteJWKSet, jwtVerify } from 'jose';

const GOOGLE_JWKS_URI = 'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com';
const FIREBASE_PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'talora-2bd7b';

const JWKS = createRemoteJWKSet(new URL(GOOGLE_JWKS_URI));

export interface FirebaseTokenPayload {
  uid: string;
  phone_number?: string;
  email?: string;
  email_verified?: boolean;
  [key: string]: unknown;
}

/**
 * Verifies a Firebase ID token and returns its decoded payload.
 * Throws if the token is invalid or expired.
 */
export async function verifyFirebaseToken(idToken: string): Promise<FirebaseTokenPayload> {
  const { payload } = await jwtVerify(idToken, JWKS, {
    issuer: `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`,
    audience: FIREBASE_PROJECT_ID,
  });

  return {
    uid: payload.sub as string,
    phone_number: payload.phone_number as string | undefined,
    email: payload.email as string | undefined,
    email_verified: payload.email_verified as boolean | undefined,
    ...payload,
  };
}

// Kept for backward compatibility with any code that imports adminAuth.
// Phone verification now uses verifyFirebaseToken directly.
export const adminAuth = null;
