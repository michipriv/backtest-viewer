/*
  Filename: frontend/src/components/ImageLightbox.jsx
  V 1.03
*/
import React, { useState, useEffect } from 'react';

/**
 * Lightbox-Komponente für Vollbildansicht mit Navigation
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
      className="position-fixed top-0 start-0 w-100 h-100 d-flex flex-column"
      style={{ 
        backgroundColor: 'rgba(0,0,0,0.95)',
        zIndex: 9999
      }}
      onClick={onClose}
    >
      <div className="d-flex justify-content-between align-items-center p-3 text-white">
        <h5 className="mb-0">
          {coin} - {dateData.date} #{dateData.sequence} - {currentTimeframe}
        </h5>
        <button 
          type="button" 
          className="btn-close btn-close-white"
          onClick={onClose}
        ></button>
      </div>
      
      <div 
        className="flex-grow-1 d-flex align-items-center justify-content-center p-3"
        onClick={(e) => e.stopPropagation()}
        style={{ minHeight: 0 }}
      >
        <img 
          src={imageUrl}
          alt={`${dateData.date} - ${currentTimeframe}`}
          style={{ 
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain'
          }}
        />
      </div>
      
      <div className="d-flex justify-content-between align-items-center p-3 text-white">
        <button 
          className="btn btn-light"
          onClick={handlePrevious}
          disabled={currentTimeframeIndex === 0}
        >
          ← Vorherige Zeiteinheit
        </button>
        <span>
          {currentTimeframeIndex + 1} / {timeframes.length}
        </span>
        <button 
          className="btn btn-light"
          onClick={handleNext}
          disabled={currentTimeframeIndex === timeframes.length - 1}
        >
          Nächste Zeiteinheit →
        </button>
      </div>
    </div>
  );
}

export default ImageLightbox;

// EOF
