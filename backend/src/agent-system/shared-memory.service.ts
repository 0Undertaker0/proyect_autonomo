import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { DatabaseService } from '../database/database.service.js';

@Injectable()
export class SharedMemoryService {
  constructor(private readonly databaseService: DatabaseService) {}

  getMemory() {
    return this.databaseService
      .getDb()
      .prepare(
        'SELECT id, key, value, category, created_at as createdAt, updated_at as updatedAt FROM shared_memory ORDER BY created_at DESC',
      )
      .all();
  }

  addMemory(input: { key: string; value: string; category: string }) {
    const key = input.key.trim();
    const value = input.value.trim();

    if (!key || !value) {
      throw new Error('La clave y el valor de la memoria no pueden estar vacíos.');
    }

    const existing = this.databaseService
      .getDb()
      .prepare('SELECT id FROM shared_memory WHERE key = ?')
      .get(key) as { id?: string } | undefined;

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
}
