import { DatabaseService } from '../database/database.service.js';
export declare class AuthService {
    private readonly databaseService;
    constructor(databaseService: DatabaseService);
    private hashPassword;
    private ensureSeedUser;
    login(username: string, password: string): {
        token: `${string}-${string}-${string}-${string}-${string}`;
        expiresAt: string;
        user: {
            id: string;
            username: string;
            role: string;
        };
    };
    userFromToken(token: string): {
        id: string;
        username: string;
        role: string;
    } | null;
}
