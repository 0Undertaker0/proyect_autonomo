import { Injectable } from '@nestjs/common';
import { randomUUID, pbkdf2Sync, randomBytes, timingSafeEqual } from 'node:crypto';
import { DatabaseService } from '../database/database.service.js';

const DEFAULT_USERNAME = process.env.DEFAULT_USERNAME ?? 'admin';
const DEFAULT_PASSWORD = process.env.DEFAULT_PASSWORD ?? 'admin123';
const SESSION_TTL_MS = 1000 * 60 * 60 * 12;

@Injectable()
export class AuthService {
  constructor(private readonly databaseService: DatabaseService) {}

  private hashPassword(password: string, salt: string) {
    return pbkdf2Sync(password, salt, 120000, 64, 'sha512').toString('hex');
  }

  private ensureSeedUser() {
    const row = this.databaseService
      .getDb()
      .prepare('SELECT id FROM app_users WHERE username = ?')
      .get(DEFAULT_USERNAME) as { id?: string } | undefined;

    if (row) {
      return;
    }

    const salt = randomBytes(16).toString('hex');
    const passwordHash = this.hashPassword(DEFAULT_PASSWORD, salt);

    this.databaseService
      .getDb()
      .prepare(
        'INSERT INTO app_users (id, username, password_hash, password_salt, role) VALUES (?, ?, ?, ?, ?)',
      )
      .run(randomUUID(), DEFAULT_USERNAME, passwordHash, salt, 'admin');
  }

  login(username: string, password: string) {
    this.ensureSeedUser();

    const user = this.databaseService
      .getDb()
      .prepare('SELECT * FROM app_users WHERE username = ?')
      .get(username) as
      | {
          id: string;
          username: string;
          password_hash: string;
          password_salt: string;
          role: string;
        }
      | undefined;

    if (!user) {
      throw new Error('Credenciales inválidas.');
    }

    const passwordHash = this.hashPassword(password, user.password_salt);
    const expected = Buffer.from(user.password_hash, 'hex');
    const actual = Buffer.from(passwordHash, 'hex');

    if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
      throw new Error('Credenciales inválidas.');
    }

    const token = randomUUID();
    const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString();

    this.databaseService
      .getDb()
      .prepare('INSERT INTO user_sessions (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)')
      .run(randomUUID(), user.id, token, expiresAt);

    return {
      token,
      expiresAt,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    };
  }

  userFromToken(token: string) {
    const row = this.databaseService
      .getDb()
      .prepare(
        `SELECT u.id, u.username, u.role FROM user_sessions s
         JOIN app_users u ON u.id = s.user_id
         WHERE s.token = ? AND s.expires_at > ?`,
      )
      .get(token, new Date().toISOString()) as
      | {
          id: string;
          username: string;
          role: string;
        }
      | undefined;

    return row ?? null;
  }
}
