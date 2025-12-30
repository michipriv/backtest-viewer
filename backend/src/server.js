/*
  Filename: backend/src/server.js
  V 1.06
*/
import express from 'express';
import cors from 'cors';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { logger } from './logger.js';
import { loadConfig, validateConfig } from './config.js';
import { scanAllCoins, getCoinStats } from '../modules/imageScanner.js';
import { initDatabase, getDateNote, saveDateNote, deleteDateNote, closeDatabase } from '../modules/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

let config;
let coinData;

/**
 * Initialisiert den Server
 */
async function initServer() {
  try {
    config = loadConfig();
    validateConfig(config);
    
    initDatabase();
    
    coinData = scanAllCoins(config.basePath, config.coins, config.timeframes);
    
    const stats = getCoinStats(coinData);
    logger.info({ 
      totalCoins: stats.totalCoins,
      stats: stats.byCoin
    }, 'Server initialisiert');
    
  } catch (error) {
    logger.error({ error: error.message }, 'Fehler bei Server-Initialisierung');
    throw error;
  }
}

app.use(cors());
app.use(express.json());

/**
 * GET /api/coins
 * Gibt alle verfügbaren Coins zurück
 */
app.get('/api/coins', (req, res) => {
  try {
    logger.info('GET /api/coins aufgerufen');
    const coins = Object.keys(coinData);
    res.json({
      success: true,
      data: coins
    });
  } catch (error) {
    logger.error({ error: error.message }, 'Fehler bei /api/coins');
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/images/:coin
 * Gibt alle gescannten Bilddaten für einen Coin zurück
 */
app.get('/api/images/:coin', (req, res) => {
  try {
    const { coin } = req.params;
    logger.info({ coin }, 'GET /api/images/:coin aufgerufen');
    
    if (!coinData[coin]) {
      return res.status(404).json({
        success: false,
        error: `Coin ${coin} nicht gefunden`
      });
    }
    
    res.json({
      success: true,
      data: coinData[coin],
      stats: getCoinStats({ [coin]: coinData[coin] })
    });
  } catch (error) {
    logger.error({ error: error.message }, 'Fehler bei /api/images/:coin');
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/image/:coin/:filename
 * Liefert ein spezifisches Bild aus
 */
app.get('/api/image/:coin/:filename', (req, res) => {
  try {
    const { coin, filename } = req.params;
    const imagePath = join(config.basePath, coin, filename);
    
    logger.info({ imagePath }, 'Bild angefordert');
    res.sendFile(imagePath);
    
  } catch (error) {
    logger.error({ error: error.message }, 'Fehler beim Laden des Bildes');
    res.status(404).json({
      success: false,
      error: 'Bild nicht gefunden'
    });
  }
});

/**
 * GET /api/config
 * Gibt aktuelle Konfiguration zurück
 */
app.get('/api/config', (req, res) => {
  try {
    logger.info('GET /api/config aufgerufen');
    res.json({
      success: true,
      config: {
        coins: config.coins,
        timeframes: config.timeframes
      }
    });
  } catch (error) {
    logger.error({ error: error.message }, 'Fehler bei /api/config');
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/notes/:coin/:dateKey
 * Holt eine Notiz für Coin und Datum
 */
app.get('/api/notes/:coin/:dateKey', (req, res) => {
  try {
    const { coin, dateKey } = req.params;
    const fullKey = `${coin}-${dateKey}`;
    const note = getDateNote(fullKey);
    
    res.json({
      success: true,
      data: note
    });
  } catch (error) {
    logger.error({ error: error.message }, 'Fehler beim Abrufen der Notiz');
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/notes
 * Speichert eine Notiz
 */
app.post('/api/notes', (req, res) => {
  try {
    const { coin, dateKey, note } = req.body;
    
    if (!coin || !dateKey) {
      return res.status(400).json({
        success: false,
        error: 'coin und dateKey sind erforderlich'
      });
    }
    
    const fullKey = `${coin}-${dateKey}`;
    const savedNote = saveDateNote(fullKey, note || '');
    
    res.json({
      success: true,
      data: savedNote
    });
  } catch (error) {
    logger.error({ error: error.message }, 'Fehler beim Speichern der Notiz');
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});



/**
 * DELETE /api/notes/:coin/:dateKey
 * Löscht eine Notiz
 */
app.delete('/api/notes/:coin/:dateKey', (req, res) => {
  try {
    const { coin, dateKey } = req.params;
    const fullKey = `${coin}-${dateKey}`;
    const deleted = deleteDateNote(fullKey);
    
    res.json({
      success: true,
      deleted
    });
  } catch (error) {
    logger.error({ error: error.message }, 'Fehler beim Löschen der Notiz');
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Startet den Server
 */
async function startServer() {
  await initServer();
  
  const { port, host } = config.server;
  
  app.listen(port, host, () => {
    logger.info({ port, host }, `Server läuft auf http://${host}:${port}`);
  });
}

/**
 * Graceful Shutdown
 */
process.on('SIGINT', () => {
  closeDatabase();
  process.exit(0);
});

process.on('SIGTERM', () => {
  closeDatabase();
  process.exit(0);
});

startServer().catch(error => {
  logger.error({ error: error.message }, 'Server konnte nicht gestartet werden');
  process.exit(1);
});

// EOF
