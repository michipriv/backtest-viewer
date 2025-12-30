/*
  Filename: frontend/src/hooks/useImages.js
  V 1.03
*/
import { useState, useEffect, useCallback } from 'react';

/**
 * Custom Hook zum Laden der Bilddaten vom Backend für einen spezifischen Coin
 * @param {string} coin - Coin-Name (z.B. 'SOL', 'BTC')
 * @returns {Object} { images, loading, error, stats, reload }
 */
export function useImages(coin) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  /**
   * Lädt Bilddaten vom Backend
   */
  const fetchImages = useCallback(async () => {
    if (!coin) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/images/${coin}`, {
        credentials: 'include'
      });
      
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
  }, [coin]);

  useEffect(() => {
    fetchImages();
  }, [fetchImages, refreshTrigger]);

  /**
   * Funktion zum manuellen Neuladen
   */
  const reload = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  return { images, loading, error, stats, reload };
}

// EOF
