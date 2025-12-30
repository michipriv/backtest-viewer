/*
  Filename: frontend/src/components/ImageGallery.jsx
  V 1.05
*/
import React, { useState } from 'react';
import { useNotes } from '../hooks/useNotes.js';

/**
 * Zeigt alle Bilder eines Datums als Thumbnail-Grid mit einem Notizfeld für das gesamte Datum
 * @param {Object} props
 * @param {string} props.coin - Coin-Name
 * @param {Object} props.dateData - Daten für ein Datum
 * @param {Function} props.onImageClick - Callback beim Klick auf Bild
 * @returns {JSX.Element}
 */
function ImageGallery({ coin, dateData, onImageClick }) {
  const timeframes = ['1m', '3m', '5m', '15m', '1h', '4h'];
  const { note, setNote, saveStatus } = useNotes(coin, dateData.dateKey);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  /**
   * Maximiert das Notizfeld auf Vollbild
   */
  const handleMaximize = () => {
    setIsMaximized(true);
    setIsMinimized(false);
  };

  /**
   * Minimiert das Notizfeld
   */
  const handleMinimize = () => {
    setIsMinimized(true);
    setIsMaximized(false);
  };

  /**
   * Stellt normale Größe wieder her
   */
  const handleRestore = () => {
    setIsMaximized(false);
    setIsMinimized(false);
  };

  if (isMinimized) {
    return (
      <>
        <div className="row g-3 mb-4">
          {timeframes.map(timeframe => {
            const imageData = dateData.images[timeframe];
            
            if (!imageData) {
              return (
                <div key={timeframe} className="col-12 col-md-6 col-lg-4">
                  <div className="card">
                    <div className="card-body text-center text-muted">
                      <p className="mb-0">{timeframe}</p>
                      <small>Kein Bild vorhanden</small>
                    </div>
                  </div>
                </div>
              );
            }

            const imageUrl = `/api/image/${coin}/${imageData.filename}`;

            return (
              <div key={timeframe} className="col-12 col-md-6 col-lg-4">
                <div className="card h-100 shadow-sm">
                  <div 
                    style={{ cursor: 'pointer' }}
                    onClick={() => onImageClick(timeframe)}
                  >
                    <img 
                      src={imageUrl} 
                      className="card-img-top"
                      alt={`${dateData.date} - ${timeframe}`}
                      style={{ 
                        objectFit: 'contain',
                        height: '200px',
                        backgroundColor: '#f8f9fa'
                      }}
                    />
                  </div>
                  <div className="card-body">
                    <h6 className="card-title mb-0">{timeframe}</h6>
                    <small className="text-muted">{imageData.filename}</small>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="card shadow-sm">
          <div className="card-body py-2">
            <div className="d-flex justify-content-between align-items-center">
              <h6 className="card-title mb-0">Notizen (minimiert)</h6>
              <div className="d-flex gap-2 align-items-center">
                {saveStatus === 'saving' && (
                  <small className="text-muted">Speichere...</small>
                )}
                {saveStatus === 'saved' && (
                  <small className="text-success">✓</small>
                )}
                {saveStatus === 'error' && (
                  <small className="text-danger">✗</small>
                )}
                <button 
                  className="btn btn-sm btn-outline-primary"
                  onClick={handleRestore}
                  title="Wiederherstellen"
                >
                  ↕
                </button>
                <button 
                  className="btn btn-sm btn-outline-primary"
                  onClick={handleMaximize}
                  title="Maximieren"
                >
                  ⛶
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (isMaximized) {
    return (
      <div 
        className="position-fixed top-0 start-0 w-100 h-100 d-flex flex-column"
        style={{ 
          backgroundColor: 'white',
          zIndex: 9998,
          padding: '20px'
        }}
      >
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0">Notizen für {dateData.date} #{dateData.sequence}</h5>
          <div className="d-flex gap-2 align-items-center">
            {saveStatus === 'saving' && (
              <small className="text-muted">Speichere...</small>
            )}
            {saveStatus === 'saved' && (
              <small className="text-success">✓ Gespeichert</small>
            )}
            {saveStatus === 'error' && (
              <small className="text-danger">✗ Fehler</small>
            )}
            <button 
              className="btn btn-sm btn-outline-secondary"
              onClick={handleMinimize}
              title="Minimieren"
            >
              ▬
            </button>
            <button 
              className="btn btn-sm btn-outline-secondary"
              onClick={handleRestore}
              title="Wiederherstellen"
            >
              ❐
            </button>
          </div>
        </div>
        <textarea
          className="form-control flex-grow-1"
          placeholder="Notizen für dieses Datum..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          style={{ resize: 'none' }}
        />
      </div>
    );
  }

  return (
    <>
      <div className="row g-3 mb-4">
        {timeframes.map(timeframe => {
          const imageData = dateData.images[timeframe];
          
          if (!imageData) {
            return (
              <div key={timeframe} className="col-12 col-md-6 col-lg-4">
                <div className="card">
                  <div className="card-body text-center text-muted">
                    <p className="mb-0">{timeframe}</p>
                    <small>Kein Bild vorhanden</small>
                  </div>
                </div>
              </div>
            );
          }

          const imageUrl = `/api/image/${coin}/${imageData.filename}`;

          return (
            <div key={timeframe} className="col-12 col-md-6 col-lg-4">
              <div className="card h-100 shadow-sm">
                <div 
                  style={{ cursor: 'pointer' }}
                  onClick={() => onImageClick(timeframe)}
                >
                  <img 
                    src={imageUrl} 
                    className="card-img-top"
                    alt={`${dateData.date} - ${timeframe}`}
                    style={{ 
                      objectFit: 'contain',
                      height: '200px',
                      backgroundColor: '#f8f9fa'
                    }}
                  />
                </div>
                <div className="card-body">
                  <h6 className="card-title mb-0">{timeframe}</h6>
                  <small className="text-muted">{imageData.filename}</small>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h6 className="card-title mb-0">Notizen für {dateData.date} #{dateData.sequence}</h6>
            <div className="d-flex gap-2 align-items-center">
              {saveStatus === 'saving' && (
                <small className="text-muted">Speichere...</small>
              )}
              {saveStatus === 'saved' && (
                <small className="text-success">✓ Gespeichert</small>
              )}
              {saveStatus === 'error' && (
                <small className="text-danger">✗ Fehler</small>
              )}
              <button 
                className="btn btn-sm btn-outline-primary"
                onClick={handleMinimize}
                title="Minimieren"
              >
                ▬
              </button>
              <button 
                className="btn btn-sm btn-outline-primary"
                onClick={handleMaximize}
                title="Maximieren"
              >
                ⛶
              </button>
            </div>
          </div>
          <textarea
            className="form-control"
            rows="5"
            placeholder="Notizen für dieses Datum..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
      </div>
    </>
  );
}

export default ImageGallery;

// EOF
