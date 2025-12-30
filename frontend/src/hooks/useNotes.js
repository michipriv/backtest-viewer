/*
  Filename: frontend/src/hooks/useNotes.js
  V 1.02
*/
import { useState, useEffect, useCallback } from 'react';

/**
 * Custom Hook für Notizen-Verwaltung mit Auto-Save (ein Notizfeld pro Datum)
 * @param {string} coin - Coin-Name
 * @param {string} dateKey - Datum-Key mit Sequenz
 * @returns {Object} { note, setNote, loading, error, saveStatus }
 */
export function useNotes(coin, dateKey) {
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saveStatus, setSaveStatus] = useState('saved');
  const [saveTimeout, setSaveTimeout] = useState(null);

  /**
   * Lädt die Notiz vom Backend
   */
  useEffect(() => {
    if (!coin || !dateKey) return;

    async function fetchNote() {
      try {
        setLoading(true);
        const response = await fetch(`/api/notes/${coin}/${dateKey}`);
        
        if (!response.ok) {
          throw new Error(`HTTP-Fehler: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success && result.data) {
          setNote(result.data.note || '');
        } else {
          setNote('');
        }
        
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchNote();
  }, [coin, dateKey]);

  /**
   * Speichert die Notiz mit Debounce
   */
  const saveNote = useCallback(async (noteText) => {
    try {
      setSaveStatus('saving');
      
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          coin,
          dateKey,
          note: noteText
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP-Fehler: ${response.status}`);
      }
      
      setSaveStatus('saved');
      
    } catch (err) {
      setError(err.message);
      setSaveStatus('error');
    }
  }, [coin, dateKey]);

  /**
   * Handler für Notizänderungen mit Auto-Save
   */
  const handleNoteChange = useCallback((newNote) => {
    setNote(newNote);
    setSaveStatus('pending');
    
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }
    
    const timeout = setTimeout(() => {
      saveNote(newNote);
    }, 1000);
    
    setSaveTimeout(timeout);
  }, [saveNote, saveTimeout]);

  return { 
    note, 
    setNote: handleNoteChange, 
    loading, 
    error, 
    saveStatus 
  };
}

// EOF
