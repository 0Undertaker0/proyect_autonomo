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
import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
let DatabaseService = class DatabaseService {
    db;
    constructor() {
        const dataDir = path.resolve(process.cwd(), 'data');
        fs.mkdirSync(dataDir, { recursive: true });
        const dbPath = path.join(dataDir, 'ai-content-empire.db');
        this.db = new Database(dbPath);
        this.initializeSchema();
    }
    initializeSchema() {
        this.db.exec(`
      CREATE TABLE IF NOT EXISTS agent_tasks (
        id TEXT PRIMARY KEY,
        identifier TEXT UNIQUE,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        state TEXT NOT NULL,
        priority TEXT NOT NULL,
        agent_name TEXT NOT NULL,
        model_used TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        finished_at TEXT,
        result TEXT,
        errors TEXT
      );

      CREATE TABLE IF NOT EXISTS task_dependencies (
        task_id TEXT NOT NULL,
        depends_on_task_id TEXT NOT NULL,
        PRIMARY KEY (task_id, depends_on_task_id),
        FOREIGN KEY(task_id) REFERENCES agent_tasks(id),
        FOREIGN KEY(depends_on_task_id) REFERENCES agent_tasks(id)
      );

      CREATE TABLE IF NOT EXISTS task_approvals (
        task_id TEXT PRIMARY KEY,
        required_role TEXT NOT NULL DEFAULT 'director',
        status TEXT NOT NULL DEFAULT 'pending',
        requested_by TEXT,
        approved_by TEXT,
        notes TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(task_id) REFERENCES agent_tasks(id)
      );

      CREATE TABLE IF NOT EXISTS shared_memory (
        id TEXT PRIMARY KEY,
        key TEXT UNIQUE NOT NULL,
        value TEXT NOT NULL,
        category TEXT NOT NULL DEFAULT 'general',
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS app_users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        password_salt TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'analyst',
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS user_sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        token TEXT UNIQUE NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        expires_at TEXT NOT NULL,
        FOREIGN KEY(user_id) REFERENCES app_users(id)
      );

      CREATE TABLE IF NOT EXISTS opportunities (
        id TEXT PRIMARY KEY,
        slug TEXT UNIQUE,
        name TEXT NOT NULL,
        score INTEGER NOT NULL,
        state TEXT NOT NULL,
        market TEXT NOT NULL,
        competition TEXT NOT NULL,
        profitability REAL NOT NULL,
        sources TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
        const taskCount = this.db.prepare('SELECT COUNT(*) AS count FROM agent_tasks').get();
        if (taskCount.count === 0) {
            this.db.prepare(`INSERT INTO agent_tasks (id, identifier, title, description, state, priority, agent_name, model_used, result)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?), (?, ?, ?, ?, ?, ?, ?, ?, ?), (?, ?, ?, ?, ?, ?, ?, ?, ?)`).run('task-101', 'task-101', 'Investigación de oportunidad', 'Trend Scout identifica nichos emergentes y los valida por demanda y competencia.', 'Completada', 'alta', 'Trend Scout', 'qwen2.5:7b', 'Oportunidad viable en IA aplicada a educación y productividad.', 'task-102', 'task-102', 'Evaluación de competencia', 'Market Analyst compara intensidad según idioma y nivel de saturación.', 'En revisión', 'media', 'Market Analyst', 'qwen2.5:7b', 'Se confirma competencia media y oportunidad promocional.', 'task-103', 'task-103', 'Render final del video', 'Video Producer sintetiza voz, subtítulos y render final para publicación.', 'En proceso', 'alta', 'Video Producer', 'llama3.1:8b', 'Pipeline de render funcionando con exportación local.');
        }
    }
    getDb() {
        return this.db;
    }
    onModuleDestroy() {
        this.db.close();
    }
};
DatabaseService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [])
], DatabaseService);
export { DatabaseService };
//# sourceMappingURL=database.service.js.map