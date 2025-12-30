/*
  Filename: frontend/src/hooks/useImages.js
  V 1.01
*/
import { useState, useEffect } from 'react';

/**
 * Custom Hook zum Laden der Bilddaten vom Backend für einen spezifischen Coin
 * @param {string} coin - Coin-Name (z.B. 'SOL', 'BTC')
 * @returns {Object} { images, loading, error, stats }
 */
export function useImages(coin) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (!coin) {
      setLoading(false);
      return;
    }

    /**
     * Lädt Bilddaten vom Backend
     */
    async function fetchImages() {
      try {
        setLoading(true);
        const response = await fetch(`/api/images/${coin}`);
        
        if (!response.ok) {
          throw new Error(`HTTP-Fehler: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
          setImages(result.data);
          setStats(result.stats);
        } else {
          throw new Error(result.error || 'Unbekannter Fehler');
        }
        
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchImages();
  }, [coin]);

  return { images, loading, error, stats };
}

// EOF
