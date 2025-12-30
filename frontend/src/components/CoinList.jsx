/*
  Filename: frontend/src/components/CoinList.jsx
  V 1.00
*/
import React from 'react';

/**
 * Zeigt eine Liste aller verfügbaren Coins
 * @param {Object} props
 * @param {Array<string>} props.coins - Liste der Coins
 * @param {Function} props.onSelectCoin - Callback beim Auswählen eines Coins
 * @returns {JSX.Element}
 */
function CoinList({ coins, onSelectCoin }) {
  return (
    <div className="container mt-5">
      <header className="mb-4">
        <h1 className="h2">Backtest Viewer</h1>
        <p className="text-muted">Wähle eine Kryptowährung</p>
      </header>

      <div className="row g-3">
        {coins.map(coin => (
          <div key={coin} className="col-12 col-md-6 col-lg-4">
            <div 
              className="card shadow-sm h-100"
              style={{ cursor: 'pointer' }}
              onClick={() => onSelectCoin(coin)}
            >
              <div className="card-body text-center py-5">
                <h3 className="card-title mb-2">{coin}</h3>
                <p className="text-muted mb-0">Backtests anzeigen →</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CoinList;

// EOF
