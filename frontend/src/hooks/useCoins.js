/*
  Filename: frontend/src/hooks/useCoins.js
  V 1.01
*/
import { useState, useEffect } from 'react';

/**
 * Custom Hook zum Laden der verfügbaren Coins
 * @returns {Object} { coins, loading, error }
 */
export function useCoins() {
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    /**
     * Lädt verfügbare Coins vom Backend
     */
    async function fetchCoins() {
      try {
        setLoading(true);
        const response = await fetch('/api/coins', {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error(`HTTP-Fehler: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
          setCoins(result.data);
        } else {
          throw new Error(result.error || 'Unbekannter Fehler');
        }
        
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchCoins();
  }, []);

  return { coins, loading, error };
}

// EOF
