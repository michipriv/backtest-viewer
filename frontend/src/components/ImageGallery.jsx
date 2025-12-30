/*
  Filename: frontend/src/components/ImageGallery.jsx
  V 1.06
*/
import React, { useState, useEffect } from 'react';

/**
 * Zeigt alle Bilder eines Datums mit Titel und Notizen
 */
function ImageGallery({ coin, dateData, onImageClick, onBack, dateIndex, totalDates, onPrevious, onNext }) {
  const timeframes = ['1m', '3m', '5m', '15m', '1h', '4h'];
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [saveStatus, setSaveStatus] = useState('');
  const [saveTimer, setSaveTimer] = useState(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

  // Lade Titel und Notiz
  useEffect(() => {
    loadNoteData();
  }, [coin, dateData.dateKey]);

  const loadNoteData = async () => {
    try {
      const response = await fetch(`/api/notes/${coin}/${dateData.dateKey}`, {
        credentials: 'include'
      });
      const result = await response.json();
      if (result.success && result.data) {
        setTitle(result.data.title || '');
        setNote(result.data.note || '');
      }
    } catch (err) {
      console.error('Fehler beim Laden:', err);
    }
  };

  const saveNoteData = async (newTitle, newNote) => {
    try {
      console.log('Speichere:', { coin, dateKey: dateData.dateKey, title: newTitle, note: newNote });
      setSaveStatus('Speichere...');
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          coin,
          dateKey: dateData.dateKey,
          title: newTitle,
          note: newNote
        })
      });
      
      console.log('Response status:', response.status);
      const result = await response.json();
      console.log('Response data:', result);
      
      if (response.ok) {
        setSaveStatus('Gespeichert');
        setTimeout(() => setSaveStatus(''), 2000);
      } else {
        setSaveStatus('Fehler: ' + (result.error || response.status));
        setTimeout(() => setSaveStatus(''), 3000);
      }
    } catch (err) {
      console.error('Save error:', err);
      setSaveStatus('Fehler: ' + err.message);
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    
    if (saveTimer) clearTimeout(saveTimer);
    const timer = setTimeout(() => {
      saveNoteData(newTitle, note);
    }, 1000);
    setSaveTimer(timer);
  };

  const handleNoteChange = (e) => {
    const newNote = e.target.value;
    setNote(newNote);
    
    if (saveTimer) clearTimeout(saveTimer);
    const timer = setTimeout(() => {
      saveNoteData(title, newNote);
    }, 1000);
    setSaveTimer(timer);
  };

  return (
    <div className="container-fluid py-3">
      {/* Kompakte Header-Zeile */}
      <div className="d-flex align-items-center gap-3 mb-3 flex-wrap">
        <button className="btn btn-outline-secondary btn-sm" onClick={onBack}>
          ← Zurück
        </button>
        <span className="text-muted">|</span>
        <h5 className="mb-0">{coin} - Backtest Viewer</h5>
        <span className="text-muted">|</span>
        <span className="text-muted">Datum: {dateData.date} #{dateData.sequence}</span>
        <span className="text-muted">|</span>
        <div className="d-flex align-items-center gap-2" style={{ flex: 1 }}>
          <label className="mb-0 text-nowrap">Titel:</label>
          <input
            type="text"
            className="form-control form-control-sm"
            value={title}
            onChange={handleTitleChange}
            placeholder="Titel eingeben..."
            style={{ maxWidth: '300px' }}
          />
          {saveStatus && <small className="text-success">{saveStatus}</small>}
        </div>
      </div>

      {/* Bilder Grid */}
      <div className="row g-3 mb-4">
        {timeframes.map(timeframe => {
          const imageData = dateData.images[timeframe];
          
          if (!imageData) {
            return (
              <div key={timeframe} className="col-12 col-md-6 col-lg-4">
                <div className="card">
                  <div className="card-body text-center text-muted">
                    <p className="mb-0">{timeframe}</p>
                    <small>Kein Bild</small>
                  </div>
                </div>
              </div>
            );
          }

          const imageUrl = `/api/image/${coin}/${imageData.filename}`;

          return (
            <div key={timeframe} className="col-12 col-md-6 col-lg-4">
              <div className="card h-100 shadow-sm">
                <div style={{ cursor: 'pointer' }} onClick={() => onImageClick(timeframe)}>
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
                <div className="card-body py-2">
                  <h6 className="card-title mb-0">{timeframe}</h6>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Notizen */}
      {isMinimized ? (
        <div className="card shadow-sm">
          <div className="card-body py-2">
            <div className="d-flex justify-content-between align-items-center">
              <h6 className="mb-0">Notizen (minimiert)</h6>
              <div className="d-flex gap-2">
                <button className="btn btn-sm btn-outline-secondary" onClick={() => setIsMinimized(false)}>
                  ↕
                </button>
                <button className="btn btn-sm btn-outline-secondary" onClick={() => { setIsMinimized(false); setIsMaximized(true); }}>
                  ⛶
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : isMaximized ? (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'white',
          zIndex: 1050,
          display: 'flex',
          flexDirection: 'column',
          padding: '20px'
        }}>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5>Notizen - {dateData.date} #{dateData.sequence}</h5>
            <div className="d-flex gap-2">
              <button className="btn btn-sm btn-outline-secondary" onClick={() => setIsMaximized(false)}>
                ❐ Verkleinern
              </button>
            </div>
          </div>
          <textarea
            className="form-control"
            value={note}
            onChange={handleNoteChange}
            placeholder="Notizen hier eingeben..."
            style={{ flex: 1, resize: 'none' }}
          />
        </div>
      ) : (
        <div className="card shadow-sm">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h6 className="card-title mb-0">Notizen</h6>
              <div className="d-flex gap-2">
                <button className="btn btn-sm btn-outline-secondary" onClick={() => setIsMinimized(true)}>
                  ▬
                </button>
                <button className="btn btn-sm btn-outline-secondary" onClick={() => setIsMaximized(true)}>
                  ⛶
                </button>
              </div>
            </div>
            <textarea
              className="form-control"
              value={note}
              onChange={handleNoteChange}
              rows="5"
              placeholder="Notizen hier eingeben..."
            />
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="d-flex justify-content-between mt-4">
        <button 
          className="btn btn-primary"
          onClick={onPrevious}
          disabled={dateIndex === 0}
        >
          ← Zurück
        </button>
        <button 
          className="btn btn-primary"
          onClick={onNext}
          disabled={dateIndex === totalDates - 1}
        >
          Weiter →
        </button>
      </div>
    </div>
  );
}

export default ImageGallery;

// EOF
