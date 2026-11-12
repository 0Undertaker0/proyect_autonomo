import { DatabaseService } from '../database/database.service.js';
export declare class SharedMemoryService {
    private readonly databaseService;
    constructor(databaseService: DatabaseService);
    getMemory(): any;
    addMemory(input: {
        key: string;
        value: string;
        category: string;
    }): any;
}
