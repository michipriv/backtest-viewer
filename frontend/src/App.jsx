/*
  Filename: frontend/src/App.jsx
  V 1.01
*/
import React, { useState } from 'react';
import { useCoins } from './hooks/useCoins.js';
import { useImages } from './hooks/useImages.js';
import ImageGallery from './components/ImageGallery.jsx';
import ImageLightbox from './components/ImageLightbox.jsx';

/**
 * Hauptkomponente der Anwendung
 * @returns {JSX.Element}
 */
function App() {
  const { coins, loading: coinsLoading, error: coinsError } = useCoins();
  const [selectedCoin, setSelectedCoin] = useState('');
  const { images, loading, error, stats } = useImages(selectedCoin);
  const [currentDateIndex, setCurrentDateIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState(null);

  /**
   * Setzt den ausgewählten Coin und resettet Index
   */
  const handleCoinChange = (coin) => {
    setSelectedCoin(coin);
    setCurrentDateIndex(0);
  };

  /**
   * Öffnet Lightbox für spezifisches Bild
   */
  const handleImageClick = (timeframe) => {
    setSelectedTimeframe(timeframe);
    setLightboxOpen(true);
  };

  /**
   * Schließt Lightbox
   */
  const handleCloseLightbox = () => {
    setLightboxOpen(false);
    setSelectedTimeframe(null);
  };

  /**
   * Navigiert zum nächsten Datum
   */
  const handleNext = () => {
    if (currentDateIndex < images.length - 1) {
      setCurrentDateIndex(currentDateIndex + 1);
    }
  };

  /**
   * Navigiert zum vorherigen Datum
   */
  const handlePrevious = () => {
    if (currentDateIndex > 0) {
      setCurrentDateIndex(currentDateIndex - 1);
    }
  };

  if (coinsLoading) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Lade Coins...</span>
          </div>
        </div>
      </div>
    );
  }

  if (coinsError) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Fehler</h4>
          <p>{coinsError}</p>
        </div>
      </div>
    );
  }

  if (coins.length === 0) {
    return (
      <div className="container mt-5">
        <div className="alert alert-warning" role="alert">
          Keine Coins gefunden.
        </div>
      </div>
    );
  }

  if (!selectedCoin && coins.length > 0) {
    setSelectedCoin(coins[0]);
    return null;
  }

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Lade Bilder...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Fehler</h4>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="container-fluid py-4">
        <header className="mb-4">
          <h1 className="h3">Backtest Viewer</h1>
          <div className="btn-group mb-3">
            {coins.map(coin => (
              <button
                key={coin}
                className={`btn ${selectedCoin === coin ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => handleCoinChange(coin)}
              >
                {coin}
              </button>
            ))}
          </div>
        </header>
        <div className="alert alert-warning" role="alert">
          Keine Bilder für {selectedCoin} gefunden.
        </div>
      </div>
    );
  }

  const currentDate = images[currentDateIndex];

  return (
    <div className="container-fluid py-4">
      <header className="mb-4">
        <h1 className="h3">Backtest Viewer</h1>
        
        <div className="btn-group mb-3">
          {coins.map(coin => (
            <button
              key={coin}
              className={`btn ${selectedCoin === coin ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => handleCoinChange(coin)}
            >
              {coin}
            </button>
          ))}
        </div>

        <p className="text-muted mb-1">
          {selectedCoin} - Datum {currentDateIndex + 1} von {images.length}: {currentDate.date} #{currentDate.sequence}
        </p>
        {stats && (
          <small className="text-muted">
            Gesamt: {stats.byCoin[selectedCoin]?.totalDates || 0} Datumssätze
          </small>
        )}
      </header>

      <ImageGallery 
        coin={selectedCoin}
        dateData={currentDate}
        onImageClick={handleImageClick}
      />

      <div className="d-flex justify-content-between mt-4">
        <button 
          className="btn btn-primary"
          onClick={handlePrevious}
          disabled={currentDateIndex === 0}
        >
          ← Zurück
        </button>
        <button 
          className="btn btn-primary"
          onClick={handleNext}
          disabled={currentDateIndex === images.length - 1}
        >
          Weiter →
        </button>
      </div>

      {lightboxOpen && (
        <ImageLightbox
          coin={selectedCoin}
          dateData={currentDate}
          initialTimeframe={selectedTimeframe}
          onClose={handleCloseLightbox}
        />
      )}
    </div>
  );
}

export default App;

// EOF
