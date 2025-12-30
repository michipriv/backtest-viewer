/*
  Filename: backend/modules/database.js
  V 1.02
*/
import Database from 'better-sqlite3';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { logger } from '../src/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, '../../shared/notes.db');
let db = null;

/**
 * Initialisiert die SQLite-Datenbank
 * @returns {Database} SQLite-Datenbankinstanz
 */
export function initDatabase() {
  try {
    db = new Database(dbPath);
    
    db.exec(`
      CREATE TABLE IF NOT EXISTS date_notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date_key TEXT NOT NULL UNIQUE,
        title TEXT,
        note TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    logger.info({ dbPath }, 'Datenbank initialisiert');
    return db;
    
  } catch (error) {
    logger.error({ error: error.message }, 'Fehler bei Datenbank-Initialisierung');
    throw error;
  }
}

/**
 * Holt eine Notiz für ein bestimmtes Datum (coin-date kombiniert)
 * @param {string} dateKey - Datum-Key im Format "coin-YYYY-MM-DD-sequence"
 * @returns {Object|null} Notiz-Objekt oder null
 */
export function getDateNote(dateKey) {
  try {
    const stmt = db.prepare('SELECT * FROM date_notes WHERE date_key = ?');
    const result = stmt.get(dateKey);
    
    logger.debug({ dateKey, found: !!result }, 'Notiz abgerufen');
    return result || null;
    
  } catch (error) {
    logger.error({ error: error.message, dateKey }, 'Fehler beim Abrufen der Notiz');
    throw error;
  }
}

/**
 * Speichert oder aktualisiert eine Notiz und Titel
 * @param {string} dateKey - Datum-Key im Format "coin-YYYY-MM-DD-sequence"
 * @param {string} note - Notiztext
 * @param {string} title - Titel (optional)
 * @returns {Object} Gespeicherte Notiz
 */
export function saveDateNote(dateKey, note, title = null) {
  try {
    const stmt = db.prepare(`
      INSERT INTO date_notes (date_key, note, title, updated_at)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(date_key) 
      DO UPDATE SET note = ?, title = ?, updated_at = CURRENT_TIMESTAMP
    `);
    
    stmt.run(dateKey, note, title, note, title);
    
    logger.info({ dateKey }, 'Notiz gespeichert');
    return getDateNote(dateKey);
    
  } catch (error) {
    logger.error({ error: error.message, dateKey }, 'Fehler beim Speichern der Notiz');
    throw error;
  }
}

/**
 * Löscht eine Notiz
 * @param {string} dateKey - Datum-Key
 * @returns {boolean} true wenn gelöscht
 */
export function deleteDateNote(dateKey) {
  try {
    const stmt = db.prepare('DELETE FROM date_notes WHERE date_key = ?');
    const info = stmt.run(dateKey);
    
    logger.info({ dateKey, deleted: info.changes > 0 }, 'Notiz gelöscht');
    return info.changes > 0;
    
  } catch (error) {
    logger.error({ error: error.message, dateKey }, 'Fehler beim Löschen der Notiz');
    throw error;
  }
}

/**
 * Schließt die Datenbankverbindung
 */
export function closeDatabase() {
  if (db) {
    db.close();
    logger.info('Datenbank geschlossen');
  }
}

// EOF
