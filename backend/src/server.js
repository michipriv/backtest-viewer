/*
  Filename: backend/src/server.js
  V 1.10
*/
import express from 'express';
import session from 'express-session';
import cors from 'cors';
import multer from 'multer';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { writeFileSync, readdirSync, unlinkSync } from 'fs';
import { logger } from './logger.js';
import { loadConfig, validateConfig } from './config.js';
import { scanAllCoins, getCoinStats } from '../modules/imageScanner.js';
import { initDatabase, getDateNote, saveDateNote, deleteDateNote, closeDatabase } from '../modules/database.js';
import { initAuthDatabase, verifyLogin, closeAuthDatabase } from '../modules/auth.js';

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
    initAuthDatabase();
    
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

/**
 * Scannt alle Coins neu
 */
function rescanCoins() {
  try {
    coinData = scanAllCoins(config.basePath, config.coins, config.timeframes);
    logger.info('Coins neu gescannt');
  } catch (error) {
    logger.error({ error: error.message }, 'Fehler beim Neu-Scannen');
    throw error;
  }
}

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

app.use(session({
  secret: 'backtest-viewer-secret-key-2025',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

const upload = multer({ storage: multer.memoryStorage() });

/**
 * Middleware: Prüft ob User eingeloggt ist
 */
function requireAuth(req, res, next) {
  if (req.session && req.session.authenticated) {
    return next();
  }
  res.status(401).json({
    success: false,
    error: 'Nicht authentifiziert'
  });
}

/**
 * POST /api/login
 * Login-Endpoint
 */
app.post('/api/login', (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Username und Passwort erforderlich'
      });
    }

    if (verifyLogin(username, password)) {
      req.session.authenticated = true;
      req.session.username = username;
      
      res.json({
        success: true,
        username
      });
    } else {
      res.status(401).json({
        success: false,
        error: 'Ungültige Anmeldedaten'
      });
    }
    
  } catch (error) {
    logger.error({ error: error.message }, 'Fehler beim Login');
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/logout
 * Logout-Endpoint
 */
app.post('/api/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

/**
 * GET /api/auth/status
 * Prüft Auth-Status
 */
app.get('/api/auth/status', (req, res) => {
  res.json({
    authenticated: req.session && req.session.authenticated === true,
    username: req.session?.username
  });
});

/**
 * GET /api/coins
 * Gibt alle verfügbaren Coins zurück
 */
app.get('/api/coins', requireAuth, (req, res) => {
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
app.get('/api/images/:coin', requireAuth, (req, res) => {
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
app.get('/api/image/:coin/:filename', requireAuth, (req, res) => {
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
app.get('/api/config', requireAuth, (req, res) => {
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
app.get('/api/notes/:coin/:dateKey', requireAuth, (req, res) => {
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
app.post('/api/notes', requireAuth, (req, res) => {
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
app.delete('/api/notes/:coin/:dateKey', requireAuth, (req, res) => {
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
 * POST /api/upload
 * Lädt neue Bilder hoch
 */
app.post('/api/upload', requireAuth, upload.any(), (req, res) => {
  try {
    const { coin, date } = req.body;
    const files = req.files;

    if (!coin || !date) {
      return res.status(400).json({
        success: false,
        error: 'coin und date sind erforderlich'
      });
    }

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Keine Dateien hochgeladen'
      });
    }

    const coinPath = join(config.basePath, coin);
    
    // Ermittle nächste Sequenznummer
    const existingFiles = readdirSync(coinPath).filter(file => 
      file.startsWith(date.replace(/-/g, '.'))
    );
    
    let maxSequence = 0;
    existingFiles.forEach(file => {
      const match = file.match(/-(\d+)_/);
      if (match) {
        maxSequence = Math.max(maxSequence, parseInt(match[1]));
      }
    });
    
    const sequence = maxSequence + 1;
    const dateFormatted = date.replace(/-/g, '.');

    // Speichere alle Dateien
    const savedFiles = [];
    files.forEach(file => {
      const timeframe = file.fieldname;
      const ext = '.png';
      const filename = `${dateFormatted}-${sequence}_${timeframe}${ext}`;
      const filepath = join(coinPath, filename);
      
      writeFileSync(filepath, file.buffer);
      savedFiles.push(filename);
      
      logger.info({ coin, filename }, 'Bild gespeichert');
    });

    res.json({
      success: true,
      files: savedFiles,
      sequence
    });
    
    // Scanne Coins neu nach Upload
    rescanCoins();
    
  } catch (error) {
    logger.error({ error: error.message }, 'Fehler beim Upload');
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /api/images/:coin/:dateKey
 * Löscht alle Bilder eines Datums
 */
app.delete('/api/images/:coin/:dateKey', requireAuth, (req, res) => {
  try {
    const { coin, dateKey } = req.params;
    const coinPath = join(config.basePath, coin);
    
    // Finde alle Dateien für diesen dateKey
    const files = readdirSync(coinPath).filter(file => {
      const match = file.match(/^(\d{4}\.\d{2}\.\d{2})-(\d+)_/);
      if (!match) return false;
      
      const fileDate = match[1].replace(/\./g, '-');
      const fileSequence = match[2];
      const fileDateKey = `${fileDate}-${fileSequence}`;
      
      return fileDateKey === dateKey;
    });

    if (files.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Keine Dateien gefunden'
      });
    }

    // Lösche alle gefundenen Dateien
    files.forEach(file => {
      const filepath = join(coinPath, file);
      unlinkSync(filepath);
      logger.info({ coin, file }, 'Bild gelöscht');
    });

    // Lösche zugehörige Notiz
    const fullKey = `${coin}-${dateKey}`;
    deleteDateNote(fullKey);

    res.json({
      success: true,
      deletedFiles: files.length
    });
    
    // Scanne Coins neu
    rescanCoins();
    
  } catch (error) {
    logger.error({ error: error.message }, 'Fehler beim Löschen');
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
  closeAuthDatabase();
  process.exit(0);
});

process.on('SIGTERM', () => {
  closeDatabase();
  closeAuthDatabase();
  process.exit(0);
});

startServer().catch(error => {
  logger.error({ error: error.message }, 'Server konnte nicht gestartet werden');
  process.exit(1);
});

// EOF
