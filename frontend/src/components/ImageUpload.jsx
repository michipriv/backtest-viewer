/*
  Filename: frontend/src/components/ImageUpload.jsx
  V 1.00
*/
import React, { useState } from 'react';

/**
 * Upload-Komponente für neue Backtest-Bilder
 * @param {Object} props
 * @param {string} props.coin - Coin-Name
 * @param {Function} props.onBack - Callback für Zurück-Button
 * @param {Function} props.onComplete - Callback nach erfolgreichem Upload
 * @returns {JSX.Element}
 */
function ImageUpload({ coin, onBack, onComplete }) {
  const timeframes = ['1m', '3m', '5m', '15m', '1h', '4h'];
  const [images, setImages] = useState({});
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Behandelt Paste-Event für ein Timeframe
   */
  const handlePaste = (timeframe, event) => {
    event.preventDefault();
    const items = event.clipboardData?.items;
    
    if (!items) return;
    
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const blob = items[i].getAsFile();
        setImages(prev => ({
          ...prev,
          [timeframe]: blob
        }));
        break;
      }
    }
  };

  /**
   * Behandelt Drag & Drop
   */
  const handleDrop = (timeframe, event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    
    if (file && file.type.indexOf('image') !== -1) {
      setImages(prev => ({
        ...prev,
        [timeframe]: file
      }));
    }
  };

  /**
   * Behandelt Datei-Auswahl
   */
  const handleFileSelect = (timeframe, event) => {
    const file = event.target.files[0];
    
    if (file) {
      setImages(prev => ({
        ...prev,
        [timeframe]: file
      }));
    }
  };

  /**
   * Entfernt ein Bild
   */
  const handleRemove = (timeframe) => {
    setImages(prev => {
      const newImages = { ...prev };
      delete newImages[timeframe];
      return newImages;
    });
  };

  /**
   * Upload aller Bilder
   */
  const handleUpload = async () => {
    if (Object.keys(images).length === 0) {
      setError('Bitte mindestens ein Bild hinzufügen');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('coin', coin);
      formData.append('date', date);

      Object.entries(images).forEach(([timeframe, file]) => {
        formData.append(timeframe, file);
      });

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Upload fehlgeschlagen: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        onComplete();
      } else {
        throw new Error(result.error || 'Upload fehlgeschlagen');
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container mt-5">
      <header className="mb-4">
        <button 
          className="btn btn-outline-secondary mb-3"
          onClick={onBack}
        >
          ← Zurück zur Datumsliste
        </button>
        <h1 className="h2">{coin} - Neue Bilder hochladen</h1>
      </header>

      <div className="card mb-4">
        <div className="card-body">
          <label className="form-label">Datum</label>
          <input 
            type="date"
            className="form-control"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <small className="text-muted">
            Die Sequenznummer wird automatisch ermittelt
          </small>
        </div>
      </div>

      <div className="row g-3 mb-4">
        {timeframes.map(timeframe => (
          <div key={timeframe} className="col-12 col-md-6 col-lg-4">
            <div className="card h-100">
              <div className="card-body">
                <h6 className="card-title">{timeframe}</h6>
                
                {!images[timeframe] ? (
                  <div
                    className="border border-2 border-dashed rounded p-4 text-center"
                    style={{ 
                      minHeight: '200px',
                      cursor: 'pointer',
                      backgroundColor: '#f8f9fa'
                    }}
                    onPaste={(e) => handlePaste(timeframe, e)}
                    onDrop={(e) => handleDrop(timeframe, e)}
                    onDragOver={(e) => e.preventDefault()}
                    tabIndex={0}
                  >
                    <p className="text-muted mb-2">
                      <strong>Strg+V</strong> zum Einfügen<br/>
                      oder Drag & Drop
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileSelect(timeframe, e)}
                      style={{ display: 'none' }}
                      id={`file-${timeframe}`}
                    />
                    <label 
                      htmlFor={`file-${timeframe}`}
                      className="btn btn-sm btn-outline-primary"
                    >
                      Datei auswählen
                    </label>
                  </div>
                ) : (
                  <div className="position-relative">
                    <img 
                      src={URL.createObjectURL(images[timeframe])}
                      alt={timeframe}
                      className="img-fluid rounded"
                      style={{ maxHeight: '200px', width: '100%', objectFit: 'contain' }}
                    />
                    <button
                      className="btn btn-sm btn-danger position-absolute top-0 end-0 m-2"
                      onClick={() => handleRemove(timeframe)}
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="d-flex justify-content-end gap-2">
        <button 
          className="btn btn-secondary"
          onClick={onBack}
          disabled={uploading}
        >
          Abbrechen
        </button>
        <button 
          className="btn btn-primary"
          onClick={handleUpload}
          disabled={uploading || Object.keys(images).length === 0}
        >
          {uploading ? 'Wird hochgeladen...' : `${Object.keys(images).length} Bild(er) hochladen`}
        </button>
      </div>
    </div>
  );
}

export default ImageUpload;

// EOF
