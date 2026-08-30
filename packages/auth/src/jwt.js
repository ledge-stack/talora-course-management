"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signJwt = signJwt;
exports.verifyJwt = verifyJwt;
const jose_1 = require("jose");
// In production, this should be a secure random string provided via environment variables.
// It MUST be the same secret used by the Next.js app to sign and verify.
const getSecretKey = () => {
    const secret = process.env.JWT_SECRET || 'talora-super-secret-development-key-change-me';
    return new TextEncoder().encode(secret);
};
async function signJwt(payload, expiresIn = '24h') {
    const alg = 'HS256';
    return new jose_1.SignJWT({ ...payload })
        .setProtectedHeader({ alg })
        .setIssuedAt()
        .setExpirationTime(expiresIn)
        .sign(getSecretKey());
}
async function verifyJwt(token) {
    const { payload } = await (0, jose_1.jwtVerify)(token, getSecretKey());
    return payload;
}
