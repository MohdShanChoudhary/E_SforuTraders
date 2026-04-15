import { useState } from 'react';
import API from '../api';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      setError('ID aur Password dono daalo');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await API.post('/api/login', {
        username,
        password,
      });

      // ✅ handle different backend formats
      const token = res.data?.token || res.data?.data?.token;

      if (!token) {
        throw new Error('Token nahi mila');
      }

      localStorage.setItem('token', token);

      if (onLogin) onLogin();

    } catch (err) {
      console.log("Login Error:", err.response?.data || err.message);

      setError(
        err.response?.data?.message ||
        'Galat ID ya Password'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}>
          <h1 style={styles.company}>S Four Traders</h1>
          <p style={styles.address}>Muzaffarnagar, U.P.</p>
          <span style={styles.gstin}>GSTIN: 09AGOPA6566D2Z9</span>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>User ID</label>
          <input
            style={styles.input}
            type="text"
            placeholder="Enter your ID"
            value={username}
            onChange={e => setUsername(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Password</label>
          <input
            style={styles.input}
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
          />
        </div>

        {error && <p style={styles.error}>{error}</p>}

        <button
          style={{
            ...styles.btn,
            opacity: loading ? 0.7 : 1,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login →'}
        </button>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #1a1a1a 0%, #2d0a0c 50%, #1a1a1a 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    background: 'white',
    borderRadius: '16px',
    padding: '48px 40px',
    width: '380px',
    boxShadow: '0 8px 40px rgba(0,0,0,0.3)',
    borderTop: '5px solid #c0272d',
  },
  logo: { textAlign: 'center', marginBottom: '32px' },
  company: { fontFamily: 'Georgia, serif', fontSize: '28px', color: '#c0272d', margin: 0 },
  address: { fontSize: '12px', color: '#888', margin: '4px 0', letterSpacing: '1px' },
  gstin: {
    fontFamily: 'monospace',
    fontSize: '11px',
    color: '#666',
    background: '#f4f4f4',
    padding: '4px 10px',
    borderRadius: '4px',
  },
  formGroup: { marginBottom: '20px' },
  label: {
    display: 'block',
    fontSize: '12px',
    fontWeight: '600',
    color: '#666',
    marginBottom: '6px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    border: '1.5px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '14px',
    boxSizing: 'border-box',
    outline: 'none',
  },
  error: {
    color: '#c0272d',
    fontSize: '13px',
    textAlign: 'center',
    marginBottom: '12px',
  },
  btn: {
    width: '100%',
    padding: '14px',
    background: '#c0272d',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '600',
  },
};