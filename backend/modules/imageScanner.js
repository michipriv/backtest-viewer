/*
  Filename: backend/modules/imageScanner.js
  V 1.03
*/
import { readdirSync, existsSync, statSync } from 'fs';
import { join } from 'path';
import { logger } from '../src/logger.js';

/**
 * Scannt alle Coin-Verzeichnisse und gruppiert Bilder nach Coin und Datum
 * Format: YYYY.MM.DD-N_timeframe.ext (N ist optional für mehrere Bilder am selben Tag)
 * @param {string} basePath - Basispfad zum Backtest-Verzeichnis
 * @param {Array<string>} coins - Array der Coin-Namen
 * @param {Array<string>} timeframes - Array der Zeiteinheiten
 * @returns {Object} Objekt mit Coins als Keys und Arrays von Datum-Objekten als Values
 */
export function scanAllCoins(basePath, coins, timeframes) {
  logger.info({ basePath, coins }, 'Starte Multi-Coin Bild-Scan');
  
  if (!existsSync(basePath)) {
    logger.error({ basePath }, 'Basispfad existiert nicht');
    throw new Error(`Pfad existiert nicht: ${basePath}`);
  }

  const result = {};
  
  coins.forEach(coin => {
    const coinPath = join(basePath, coin);
    
    if (existsSync(coinPath) && statSync(coinPath).isDirectory()) {
      result[coin] = scanCoinImages(coinPath, coin, timeframes);
    } else {
      logger.warn({ coin, coinPath }, 'Coin-Verzeichnis nicht gefunden');
      result[coin] = [];
    }
  });

  logger.info({ totalCoins: Object.keys(result).length }, 'Multi-Coin Scan abgeschlossen');
  return result;
}

/**
 * Scannt ein einzelnes Coin-Verzeichnis
 * @param {string} coinPath - Pfad zum Coin-Verzeichnis
 * @param {string} coin - Coin-Name
 * @param {Array<string>} timeframes - Array der Zeiteinheiten
 * @returns {Array<Object>} Array von Datum-Objekten mit Bildern
 */
function scanCoinImages(coinPath, coin, timeframes) {
  const imagesByDate = new Map();
  
  try {
    const files = readdirSync(coinPath).filter(file => 
      /\.(jpg|jpeg|png|gif|webp)$/i.test(file)
    );

    logger.info({ coin, totalFiles: files.length }, 'Dateien gefunden');

    files.forEach(file => {
      const match = file.match(/^(\d{4}\.\d{2}\.\d{2})(?:-(\d+))?_(.+?)\.(jpg|jpeg|png|gif|webp)$/i);
      
      if (match) {
        const datePart = match[1];
        const sequenceNum = match[2] || '1';
        const timeframePart = match[3];
        
        const date = datePart.replace(/\./g, '-');
        const dateKey = `${date}-${sequenceNum}`;
        
        const timeframeMap = {
          '1m': '1m',
          '1min': '1m',
          '3m': '3m',
          '3min': '3m',
          '5m': '5m',
          '5min': '5m',
          '15m': '15m',
          '15min': '15m',
          '1h': '1h',
          '4h': '4h'
        };
        
        const normalizedTimeframe = timeframeMap[timeframePart.toLowerCase()];
        
        if (normalizedTimeframe && timeframes.includes(normalizedTimeframe)) {
          if (!imagesByDate.has(dateKey)) {
            imagesByDate.set(dateKey, {
              date,
              sequence: parseInt(sequenceNum),
              dateKey,
              coin,
              images: {}
            });
          }

          imagesByDate.get(dateKey).images[normalizedTimeframe] = {
            filename: file,
            path: join(coinPath, file),
            timeframe: normalizedTimeframe,
            coin
          };
          
          logger.debug({ file, dateKey, timeframe: normalizedTimeframe, coin }, 'Bild zugeordnet');
        }
      }
    });

    const result = Array.from(imagesByDate.values())
      .sort((a, b) => {
        const dateCompare = a.date.localeCompare(b.date);
        if (dateCompare !== 0) return dateCompare;
        return a.sequence - b.sequence;
      });

    logger.info({ coin, totalDates: result.length }, 'Coin-Scan abgeschlossen');
    return result;
    
  } catch (error) {
    logger.error({ error: error.message, coin }, 'Fehler beim Scannen des Coins');
    throw error;
  }
}

/**
 * Gibt die Anzahl der Bilder pro Coin und Zeiteinheit zurück
 * @param {Object} coinData - Gescannte Coin-Daten
 * @returns {Object} Statistik-Objekt
 */
export function getCoinStats(coinData) {
  const stats = {
    totalCoins: Object.keys(coinData).length,
    byTimeframe: {},
    byCoin: {}
  };

  Object.entries(coinData).forEach(([coin, dates]) => {
    stats.byCoin[coin] = {
      totalDates: dates.length,
      byTimeframe: {}
    };

    dates.forEach(dateEntry => {
      Object.keys(dateEntry.images).forEach(timeframe => {
        stats.byTimeframe[timeframe] = (stats.byTimeframe[timeframe] || 0) + 1;
        stats.byCoin[coin].byTimeframe[timeframe] = (stats.byCoin[coin].byTimeframe[timeframe] || 0) + 1;
      });
    });
  });

  logger.info({ stats }, 'Statistik erstellt');
  return stats;
}

// EOF
