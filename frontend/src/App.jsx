/*
  Filename: frontend/src/App.jsx
  V 1.02
*/
import React, { useState } from 'react';
import { useCoins } from './hooks/useCoins.js';
import { useImages } from './hooks/useImages.js';
import CoinList from './components/CoinList.jsx';
import DateList from './components/DateList.jsx';
import ImageGallery from './components/ImageGallery.jsx';
import ImageLightbox from './components/ImageLightbox.jsx';

/**
 * Hauptkomponente der Anwendung mit Routing
 * @returns {JSX.Element}
 */
function App() {
  const { coins, loading: coinsLoading, error: coinsError } = useCoins();
  const [view, setView] = useState('coins');
  const [selectedCoin, setSelectedCoin] = useState('');
  const { images, loading, error } = useImages(selectedCoin);
  const [currentDateIndex, setCurrentDateIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState(null);

  /**
   * Wählt einen Coin aus und zeigt Datumsliste
   */
  const handleSelectCoin = (coin) => {
    setSelectedCoin(coin);
    setView('dates');
  };

  /**
   * Wählt ein Datum aus und zeigt Bilder
   */
  const handleSelectDate = (index) => {
    setCurrentDateIndex(index);
    setView('images');
  };

  /**
   * Geht zurück zur Coin-Liste
   */
  const handleBackToCoins = () => {
    setView('coins');
    setSelectedCoin('');
  };

  /**
   * Geht zurück zur Datumsliste
   */
  const handleBackToDates = () => {
    setView('dates');
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

  if (view === 'coins') {
    return (
      <CoinList 
        coins={coins}
        onSelectCoin={handleSelectCoin}
      />
    );
  }

  if (view === 'dates') {
    if (loading) {
      return (
        <div className="container mt-5">
          <div className="text-center">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Lade Daten...</span>
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

    return (
      <DateList
        coin={selectedCoin}
        dates={images}
        onSelectDate={handleSelectDate}
        onBack={handleBackToCoins}
      />
    );
  }

  if (view === 'images') {
    if (images.length === 0) {
      return (
        <div className="container mt-5">
          <button 
            className="btn btn-outline-secondary mb-3"
            onClick={handleBackToDates}
          >
            ← Zurück zur Datumsliste
          </button>
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
          <button 
            className="btn btn-outline-secondary mb-3"
            onClick={handleBackToDates}
          >
            ← Zurück zur Datumsliste
          </button>
          <h1 className="h3">{selectedCoin} - Backtest Viewer</h1>
          <p className="text-muted mb-1">
            Datum {currentDateIndex + 1} von {images.length}: {currentDate.date} #{currentDate.sequence}
          </p>
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

  return null;
}

export default App;

// EOF
