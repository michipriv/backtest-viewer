/*
  Filename: frontend/src/components/ImageLightbox.jsx
  V 1.07
*/
import React, { useState, useEffect } from 'react';

/**
 * Lightbox-Komponente für Vollbildansicht mit Navigation
 * Nur Tastatursteuerung: ESC = Schließen, Pfeiltasten = Navigation
 * @param {Object} props
 * @param {string} props.coin - Coin-Name
 * @param {Object} props.dateData - Daten für ein Datum
 * @param {string} props.initialTimeframe - Initial anzuzeigende Zeiteinheit
 * @param {Function} props.onClose - Callback zum Schließen
 * @returns {JSX.Element}
 */
function ImageLightbox({ coin, dateData, initialTimeframe, onClose }) {
  const timeframes = ['1m', '3m', '5m', '15m', '1h', '4h'];
  const [currentTimeframeIndex, setCurrentTimeframeIndex] = useState(
    timeframes.indexOf(initialTimeframe)
  );

  /**
   * Navigiert zur nächsten Zeiteinheit
   */
  const handleNext = () => {
    if (currentTimeframeIndex < timeframes.length - 1) {
      setCurrentTimeframeIndex(currentTimeframeIndex + 1);
    }
  };

  /**
   * Navigiert zur vorherigen Zeiteinheit
   */
  const handlePrevious = () => {
    if (currentTimeframeIndex > 0) {
      setCurrentTimeframeIndex(currentTimeframeIndex - 1);
    }
  };

  /**
   * Tastaturnavigation
   */
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrevious();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentTimeframeIndex]);

  const currentTimeframe = timeframes[currentTimeframeIndex];
  const imageData = dateData.images[currentTimeframe];

  if (!imageData) {
    return null;
  }

  const imageUrl = `/api/image/${coin}/${imageData.filename}`;

  return (
    <div 
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#000000',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 0,
        margin: 0
      }}
      onClick={onClose}
    >
      {/* Hilfe-Text Overlay - nimmt keinen Platz weg */}
      <div
        style={{
          position: 'absolute',
          bottom: '10px',
          left: '10px',
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          color: 'white',
          fontSize: '11px',
          padding: '4px 8px',
          borderRadius: '3px',
          zIndex: 10000,
          pointerEvents: 'none'
        }}
      >
        ESC: Zurück | ← →: Navigation
      </div>

      <img 
        src={imageUrl}
        alt={`${dateData.date} - ${currentTimeframe}`}
        onClick={(e) => e.stopPropagation()}
        style={{ 
          maxWidth: '100vw',
          maxHeight: '100vh',
          width: 'auto',
          height: 'auto',
          objectFit: 'contain',
          display: 'block'
        }}
      />
    </div>
  );
}

export default ImageLightbox;

// EOF
