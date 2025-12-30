/*
  Filename: frontend/src/components/Login.jsx
  V 1.00
*/
import React, { useState } from 'react';

/**
 * Login-Komponente
 * @param {Object} props
 * @param {Function} props.onLoginSuccess - Callback nach erfolgreichem Login
 * @returns {JSX.Element}
 */
function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  /**
   * Behandelt Login-Formular
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ username, password })
      });

      const result = await response.json();

      if (result.success) {
        onLoginSuccess();
      } else {
        setError(result.error || 'Login fehlgeschlagen');
      }

    } catch (err) {
      setError('Verbindungsfehler');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-4">
          <div className="card shadow">
            <div className="card-body p-4">
              <h2 className="card-title text-center mb-4">Backtest Viewer</h2>
              <p className="text-center text-muted mb-4">Bitte anmelden</p>

              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="username" className="form-label">Benutzername</label>
                  <input
                    type="text"
                    className="form-control"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    autoFocus
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="password" className="form-label">Passwort</label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={loading}
                >
                  {loading ? 'Wird angemeldet...' : 'Anmelden'}
                </button>
              </form>

              <div className="mt-3 text-center">
                <small className="text-muted">
                  User: admin / user
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;

// EOF
