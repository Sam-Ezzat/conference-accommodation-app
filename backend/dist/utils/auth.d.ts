import { JwtPayload } from '@/types';
export declare class AuthUtils {
    private static readonly SALT_ROUNDS;
    private static readonly JWT_SECRET;
    private static readonly JWT_EXPIRES_IN;
    private static readonly REFRESH_SECRET;
    private static readonly REFRESH_EXPIRES_IN;
    static hashPassword(password: string): Promise<string>;
    static comparePassword(password: string, hash: string): Promise<boolean>;
    static generateToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string;
    static generateRefreshToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string;
    static verifyToken(token: string): JwtPayload;
    static verifyRefreshToken(token: string): JwtPayload;
    static extractTokenFromHeader(authHeader: string | undefined): string | null;
    static generateSecureToken(length?: number): string;
}
//# sourceMappingURL=auth.d.ts.map