# Backtest Viewer

Ein professionelles Tool zur Visualisierung und Dokumentation von Crypto-Backtest-Charts mit integriertem Notizensystem.

## Features

- 📊 **Multi-Coin Support** - Verwaltung mehrerer Kryptowährungen (SOL, BTC, etc.)
- 🖼️ **Chart-Visualisierung** - Anzeige von Charts in verschiedenen Zeiteinheiten (1m, 3m, 5m, 15m, 1h, 4h)
- 📝 **Notizensystem** - SQLite-basierte Notizen mit Auto-Save für jedes Datum
- 🔄 **Hot-Reload** - Automatische Code-Aktualisierung während der Entwicklung
- 📁 **Flexible Struktur** - Unterstützt mehrere Bilder pro Datum mit Sequenznummern
- 🎨 **Moderne UI** - Bootstrap 5 mit React 19
- 📋 **Umfassendes Logging** - Strukturierte Logs für Debugging und Monitoring

## Technologie-Stack

### Backend
- Node.js (LTS 2025) mit ESM
- Express.js - REST API
- better-sqlite3 - Datenbankmanagement
- pino - Strukturiertes Logging

### Frontend
- React 19
- Vite - Build-Tool
- Bootstrap 5 - UI Framework

## Installation

### Voraussetzungen
- Node.js (aktuelle LTS-Version)
- pnpm (empfohlen) oder npm
- Windows: Visual Studio Build Tools (für better-sqlite3)

### Abhängigkeiten installieren

```bash
pnpm install
```

oder

```bash
npm install
```

### better-sqlite3 kompilieren (falls nötig)

```bash
cd node_modules/.pnpm/better-sqlite3@9.6.0/node_modules/better-sqlite3
npm run build-release
```

## Konfiguration

Konfigurationsdatei: `shared/config.json`

```json
{
  "basePath": "C:\\Pfad\\zum\\backtest",
  "coins": ["SOL", "BTC"],
  "timeframes": ["1m", "3m", "5m", "15m", "1h", "4h"],
  "server": {
    "port": 3001,
    "host": "localhost"
  }
}
```

### Bildstruktur

Bilder müssen folgendem Namensschema entsprechen:

```
YYYY.MM.DD-N_timeframe.ext
```

Beispiele:
- `2025.08.11-1_1m.png`
- `2025.08.11-1_15m.png`
- `2025.08.11-2_1h.png` (zweites Set am gleichen Tag)

### Verzeichnisstruktur

```
basePath/
├── SOL/
│   ├── 2025.08.11-1_1m.png
│   ├── 2025.08.11-1_3m.png
│   └── ...
├── BTC/
│   └── ...
└── ETH/
    └── ...
```

## Verwendung

### Entwicklungsmodus starten

```bash
pnpm dev
```

Der Server startet automatisch auf:
- Backend: http://localhost:3001
- Frontend: http://localhost:5173

### Einzelne Services starten

```bash
# Nur Backend
pnpm run dev:backend

# Nur Frontend
pnpm run dev:frontend
```

### Production Build

```bash
pnpm build
```

## Projektstruktur

```
backtest-viewer/
├── backend/
│   ├── src/
│   │   ├── server.js          # Express Server
│   │   ├── config.js          # Konfigurationsverwaltung
│   │   └── logger.js          # Logging-Setup
│   └── modules/
│       ├── database.js        # SQLite-Datenbankoperationen
│       └── imageScanner.js    # Bildverzeichnis-Scanner
├── frontend/
│   ├── src/
│   │   ├── App.jsx            # Hauptkomponente
│   │   ├── components/
│   │   │   ├── ImageGallery.jsx    # Bildergalerie
│   │   │   └── ImageLightbox.jsx   # Vollbildansicht
│   │   └── hooks/
│   │       ├── useImages.js        # Bild-Daten Hook
│   │       ├── useCoins.js         # Coin-Liste Hook
│   │       └── useNotes.js         # Notizen Hook
│   └── index.html
├── shared/
│   ├── config.json           # Konfiguration
│   └── notes.db              # SQLite-Datenbank
├── logs/
│   └── all.log               # Umfassendes Log (pino + console)
├── package.json
├── vite.config.js
└── README.md
```

## API-Endpoints

### Coins
- `GET /api/coins` - Liste aller verfügbaren Coins

### Bilder
- `GET /api/images/:coin` - Alle Bilder für einen Coin
- `GET /api/image/:coin/:filename` - Einzelnes Bild abrufen
- `GET /api/config` - Server-Konfiguration

### Notizen
- `GET /api/notes/:coin/:dateKey` - Notiz für ein Datum abrufen
- `POST /api/notes` - Notiz speichern (Body: `{coin, dateKey, note}`)
- `DELETE /api/notes/:coin/:dateKey` - Notiz löschen

## Logging

Alle Logs werden in `logs/all.log` geschrieben:
- Server-Start und -Stop
- API-Requests
- Datenbankoperationen
- Console-Ausgaben
- Fehler und Exceptions

Log-Format: Strukturiertes JSON mit Zeitstempel

## Notizen-System

- **Auto-Save**: Notizen werden automatisch 1 Sekunde nach der letzten Änderung gespeichert
- **Persistenz**: SQLite-Datenbank in `shared/notes.db`
- **Scope**: Eine Notiz pro Datum (gilt für alle Zeiteinheiten)
- **Status-Anzeige**: Visuelles Feedback beim Speichern

## Entwicklung

### Code-Standards
- ESM Modules
- JSDoc-Dokumentation für alle Funktionen
- Versionierung: +0.01 pro Änderung im Dateikopf
- Max. 200 Zeilen pro Datei
- Strukturiertes Logging (kein console.log)

### Nodemon
Backend lädt automatisch bei Änderungen neu. Vite HMR für Frontend-Updates.

## Troubleshooting

### better-sqlite3 Fehler
Falls "Could not locate bindings file":
```bash
pnpm rebuild better-sqlite3
```

### Port bereits belegt
Ändere Port in `shared/config.json`:
```json
"server": { "port": 3002 }
```

### Keine Bilder gefunden
1. Prüfe `basePath` in config.json
2. Prüfe Dateinamen-Format: `YYYY.MM.DD-N_timeframe.ext`
3. Prüfe Logs: `logs/all.log`

## Lizenz

Proprietär - Alle Rechte vorbehalten

## Version

1.0 - Initiale Release

---

**Entwickelt mit:** Node.js, React, Express, SQLite, Bootstrap
