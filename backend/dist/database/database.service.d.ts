import { OnModuleDestroy } from '@nestjs/common';
export declare class DatabaseService implements OnModuleDestroy {
    private readonly db;
    constructor();
    private initializeSchema;
    getDb(): any;
    onModuleDestroy(): void;
}
