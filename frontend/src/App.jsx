/*
  Filename: frontend/src/App.jsx
  V 1.07
*/
import React, { useState, useEffect } from 'react';
import Login from './components/Login.jsx';
import CoinList from './components/CoinList.jsx';
import DateList from './components/DateList.jsx';
import ImageGallery from './components/ImageGallery.jsx';
import ImageLightbox from './components/ImageLightbox.jsx';
import ImageUpload from './components/ImageUpload.jsx';
import { useCoins } from './hooks/useCoins.js';
import { useImages } from './hooks/useImages.js';

/**
 * Hauptkomponente der Anwendung mit Auth
 * @returns {JSX.Element}
 */
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth/status', {
        credentials: 'include'
      });
      const result = await response.json();
      setIsAuthenticated(result.authenticated);
    } catch (err) {
      setIsAuthenticated(false);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  if (authLoading) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Lade...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return <AuthenticatedApp />;
}

/**
 * App nach Login
 */
function AuthenticatedApp() {
  const { coins, loading: coinsLoading, error: coinsError } = useCoins();
  const [view, setView] = useState('coins');
  const [selectedCoin, setSelectedCoin] = useState('');
  const { images, loading, error, reload } = useImages(selectedCoin);
  const [currentDateIndex, setCurrentDateIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState(null);

  const handleDeleteDate = async (dateEntry) => {
    try {
      const response = await fetch(`/api/images/${selectedCoin}/${dateEntry.dateKey}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`Löschen fehlgeschlagen: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        reload();
      } else {
        alert(`Fehler: ${result.error}`);
      }
    } catch (err) {
      alert(`Fehler beim Löschen: ${err.message}`);
    }
  };

  const handleNewUpload = () => {
    setView('upload');
  };

  const handleUploadComplete = () => {
    setView('dates');
    reload();
  };

  const handleSelectCoin = (coin) => {
    setSelectedCoin(coin);
    setView('dates');
  };

  const handleSelectDate = (index) => {
    setCurrentDateIndex(index);
    setView('images');
  };

  const handleBackToCoins = () => {
    setView('coins');
    setSelectedCoin('');
  };

  const handleBackToDates = () => {
    setView('dates');
  };

  const handleImageClick = (timeframe) => {
    setSelectedTimeframe(timeframe);
    setLightboxOpen(true);
  };

  const handleCloseLightbox = () => {
    setLightboxOpen(false);
    setSelectedTimeframe(null);
  };

  const handleNext = () => {
    if (currentDateIndex < images.length - 1) {
      setCurrentDateIndex(currentDateIndex + 1);
    }
  };

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
        onNewUpload={handleNewUpload}
        onDelete={handleDeleteDate}
        onBack={handleBackToCoins}
      />
    );
  }

  if (view === 'upload') {
    return (
      <ImageUpload
        coin={selectedCoin}
        onBack={handleBackToDates}
        onComplete={handleUploadComplete}
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
