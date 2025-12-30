/*
  Filename: backend/modules/auth.js
  V 1.01
*/
import Database from 'better-sqlite3';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createHash } from 'crypto';
import { logger } from '../src/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, '../../shared/auth.db');
let db = null;

/**
 * Initialisiert die Auth-Datenbank
 */
export function initAuthDatabase() {
  try {
    db = new Database(dbPath);
    
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Erstelle Default-User wenn keine User existieren
    const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
    
    if (userCount.count === 0) {
      const users = [
        { username: 'admin', password: 'lkjhzKJGrt@6547' },
        { username: 'user', password: 'wumpe@34274' }
      ];
      
      const stmt = db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)');
      
      users.forEach(u => {
        const hash = hashPassword(u.password);
        stmt.run(u.username, hash);
        logger.info({ username: u.username }, `User erstellt`);
      });
    }
    
    logger.info({ dbPath }, 'Auth-Datenbank initialisiert');
    return db;
    
  } catch (error) {
    logger.error({ error: error.message }, 'Fehler bei Auth-Datenbank-Initialisierung');
    throw error;
  }
}

/**
 * Hash ein Passwort
 */
function hashPassword(password) {
  return createHash('sha256').update(password).digest('hex');
}

/**
 * Prüft Login-Credentials
 */
export function verifyLogin(username, password) {
  try {
    const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
    const user = stmt.get(username);
    
    if (!user) {
      logger.warn({ username }, 'Login fehlgeschlagen: User nicht gefunden');
      return false;
    }
    
    const hash = hashPassword(password);
    
    if (hash === user.password_hash) {
      logger.info({ username }, 'Login erfolgreich');
      return true;
    } else {
      logger.warn({ username }, 'Login fehlgeschlagen: Falsches Passwort');
      return false;
    }
    
  } catch (error) {
    logger.error({ error: error.message, username }, 'Fehler beim Login');
    return false;
  }
}

/**
 * Ändert Passwort
 */
export function changePassword(username, newPassword) {
  try {
    const hash = hashPassword(newPassword);
    const stmt = db.prepare('UPDATE users SET password_hash = ? WHERE username = ?');
    const result = stmt.run(hash, username);
    
    if (result.changes > 0) {
      logger.info({ username }, 'Passwort geändert');
      return true;
    }
    
    return false;
    
  } catch (error) {
    logger.error({ error: error.message, username }, 'Fehler beim Passwort ändern');
    return false;
  }
}

/**
 * Schließt die Auth-Datenbank
 */
export function closeAuthDatabase() {
  if (db) {
    db.close();
    logger.info('Auth-Datenbank geschlossen');
  }
}

// EOF
