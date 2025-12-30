/*
  Filename: frontend/src/components/DateList.jsx
  V 1.02
*/
import React, { useState } from 'react';

/**
 * Zeigt eine kompakte Liste aller Datumssätze für einen Coin
 * @param {Object} props
 * @param {string} props.coin - Coin-Name
 * @param {Array<Object>} props.dates - Liste der Datumssätze
 * @param {Function} props.onSelectDate - Callback beim Auswählen eines Datums
 * @param {Function} props.onNewUpload - Callback für neuen Upload
 * @param {Function} props.onDelete - Callback zum Löschen eines Datums
 * @param {Function} props.onBack - Callback für Zurück-Button
 * @returns {JSX.Element}
 */
function DateList({ coin, dates, onSelectDate, onNewUpload, onDelete, onBack }) {
  const [deletingIndex, setDeletingIndex] = useState(null);

  /**
   * Behandelt Löschen mit Bestätigung
   */
  const handleDelete = async (index, event) => {
    event.stopPropagation();
    
    if (!window.confirm(`Möchtest du wirklich ${dates[index].date} #${dates[index].sequence} löschen?`)) {
      return;
    }

    setDeletingIndex(index);
    try {
      await onDelete(dates[index]);
    } finally {
      setDeletingIndex(null);
    }
  };

  return (
    <div className="container mt-5">
      <header className="mb-4">
        <button 
          className="btn btn-outline-secondary mb-3"
          onClick={onBack}
        >
          ← Zurück zur Coin-Auswahl
        </button>
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h1 className="h2">{coin} - Backtests</h1>
            <p className="text-muted mb-0">{dates.length} Datumssätze</p>
          </div>
          <button 
            className="btn btn-success"
            onClick={onNewUpload}
          >
            + Neues Datum
          </button>
        </div>
      </header>

      {dates.length === 0 ? (
        <div className="alert alert-info">
          Noch keine Datumssätze für {coin}. Klicke auf "+ Neues Datum" um Bilder hochzuladen.
        </div>
      ) : (
        <div className="list-group">
          {dates.map((dateEntry, index) => (
            <div 
              key={dateEntry.dateKey}
              className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
              style={{ cursor: 'pointer' }}
              onClick={() => onSelectDate(index)}
            >
              <span>{dateEntry.date}</span>
              <button
                className="btn btn-sm btn-outline-danger"
                onClick={(e) => handleDelete(index, e)}
                disabled={deletingIndex === index}
              >
                {deletingIndex === index ? '...' : '🗑'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default DateList;

// EOF
