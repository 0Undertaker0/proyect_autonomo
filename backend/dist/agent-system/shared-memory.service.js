var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { DatabaseService } from '../database/database.service.js';
let SharedMemoryService = class SharedMemoryService {
    databaseService;
    constructor(databaseService) {
        this.databaseService = databaseService;
    }
    getMemory() {
        return this.databaseService
            .getDb()
            .prepare('SELECT id, key, value, category, created_at as createdAt, updated_at as updatedAt FROM shared_memory ORDER BY created_at DESC')
            .all();
    }
    addMemory(input) {
        const key = input.key.trim();
        const value = input.value.trim();
        if (!key || !value) {
            throw new Error('La clave y el valor de la memoria no pueden estar vacíos.');
        }
        const existing = this.databaseService
            .getDb()
            .prepare('SELECT id FROM shared_memory WHERE key = ?')
            .get(key);
        const now = new Date().toISOString();
        if (existing) {
            this.databaseService
                .getDb()
                .prepare('UPDATE shared_memory SET value = ?, category = ?, updated_at = ? WHERE id = ?')
                .run(value, input.category ?? 'general', now, existing.id);
            return this.databaseService
                .getDb()
                .prepare('SELECT id, key, value, category, created_at as createdAt, updated_at as updatedAt FROM shared_memory WHERE id = ?')
                .get(existing.id);
        }
        const id = randomUUID();
        this.databaseService
            .getDb()
            .prepare('INSERT INTO shared_memory (id, key, value, category, updated_at) VALUES (?, ?, ?, ?, ?)')
            .run(id, key, value, input.category ?? 'general', now);
        return this.databaseService
            .getDb()
            .prepare('SELECT id, key, value, category, created_at as createdAt, updated_at as updatedAt FROM shared_memory WHERE id = ?')
            .get(id);
    }
};
SharedMemoryService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [DatabaseService])
], SharedMemoryService);
export { SharedMemoryService };
//# sourceMappingURL=shared-memory.service.js.map