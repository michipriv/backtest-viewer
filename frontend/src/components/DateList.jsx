/*
  Filename: frontend/src/components/DateList.jsx
  V 1.00
*/
import React from 'react';

/**
 * Zeigt eine Liste aller Datumssätze für einen Coin
 * @param {Object} props
 * @param {string} props.coin - Coin-Name
 * @param {Array<Object>} props.dates - Liste der Datumssätze
 * @param {Function} props.onSelectDate - Callback beim Auswählen eines Datums
 * @param {Function} props.onBack - Callback für Zurück-Button
 * @returns {JSX.Element}
 */
function DateList({ coin, dates, onSelectDate, onBack }) {
  if (dates.length === 0) {
    return (
      <div className="container mt-5">
        <header className="mb-4">
          <button 
            className="btn btn-outline-secondary mb-3"
            onClick={onBack}
          >
            ← Zurück zur Coin-Auswahl
          </button>
          <h1 className="h2">{coin} - Backtests</h1>
        </header>
        <div className="alert alert-warning">
          Keine Datumssätze für {coin} gefunden.
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <header className="mb-4">
        <button 
          className="btn btn-outline-secondary mb-3"
          onClick={onBack}
        >
          ← Zurück zur Coin-Auswahl
        </button>
        <h1 className="h2">{coin} - Backtests</h1>
        <p className="text-muted">{dates.length} Datumssätze gefunden</p>
      </header>

      <div className="row g-3">
        {dates.map((dateEntry, index) => (
          <div key={dateEntry.dateKey} className="col-12 col-md-6 col-lg-4">
            <div 
              className="card shadow-sm h-100"
              style={{ cursor: 'pointer' }}
              onClick={() => onSelectDate(index)}
            >
              <div className="card-body">
                <h5 className="card-title">{dateEntry.date}</h5>
                <p className="text-muted mb-2">Sequenz #{dateEntry.sequence}</p>
                <div className="d-flex flex-wrap gap-1">
                  {Object.keys(dateEntry.images).map(timeframe => (
                    <span 
                      key={timeframe}
                      className="badge bg-primary"
                    >
                      {timeframe}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DateList;

// EOF
