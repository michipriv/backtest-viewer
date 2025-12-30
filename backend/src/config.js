/*
  Filename: backend/src/config.js
  V 1.02
*/
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { logger } from './logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Lädt die Konfigurationsdatei
 * @returns {Object} Konfigurationsobjekt
 * @throws {Error} Wenn Konfiguration nicht geladen werden kann
 */
export function loadConfig() {
  try {
    const configPath = join(__dirname, '../../shared/config.json');
    const configData = readFileSync(configPath, 'utf-8');
    const config = JSON.parse(configData);
    logger.info({ configPath }, 'Konfiguration geladen');
    return config;
  } catch (error) {
    logger.error({ error: error.message }, 'Fehler beim Laden der Konfiguration');
    throw new Error(`Konfiguration konnte nicht geladen werden: ${error.message}`);
  }
}

/**
 * Validiert die Konfiguration
 * @param {Object} config - Konfigurationsobjekt
 * @returns {boolean} true wenn valide
 * @throws {Error} Wenn Konfiguration ungültig ist
 */
export function validateConfig(config) {
  if (!config.basePath) {
    throw new Error('basePath fehlt in der Konfiguration');
  }
  if (!Array.isArray(config.coins) || config.coins.length === 0) {
    throw new Error('coins muss ein nicht-leeres Array sein');
  }
  if (!Array.isArray(config.timeframes) || config.timeframes.length === 0) {
    throw new Error('timeframes muss ein nicht-leeres Array sein');
  }
  if (!config.server?.port) {
    throw new Error('server.port fehlt in der Konfiguration');
  }
  logger.info('Konfiguration validiert');
  return true;
}

// EOF
