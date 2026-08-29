import type { UserScope } from './index';
export declare function signJwt(payload: UserScope, expiresIn?: string | number): Promise<string>;
export declare function verifyJwt(token: string): Promise<UserScope>;
