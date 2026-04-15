import { useState } from 'react';
import API from '../api';

export default function ExcelExport() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const handleExport = async () => {
    setLoading(true);
    setMsg('');
    try {
      let url = '/api/invoices/excel';
      if (from && to) url += `?from=${from}&to=${to}`;
      const res = await API.get(url, { responseType: 'blob' });
      const blobUrl = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `SFourTraders_Invoices${from ? `_${from}_to_${to}` : ''}.xlsx`;
      a.click();
      setMsg('✅ Excel downloaded successfully!');
    } catch (err) {
      setMsg('❌ Download nahi ho saka');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '24px', marginBottom: '24px' }}>Excel Export</h2>
      <div style={styles.card}>
        <h3 style={{ marginBottom: '20px', fontSize: '16px' }}>📊 Download Invoice Data</h3>
        <div style={styles.dateRow}>
          <div>
            <label style={styles.label}>From Date</label>
            <input type="date" value={from} onChange={e => setFrom(e.target.value)} style={styles.input} />
          </div>
          <div>
            <label style={styles.label}>To Date</label>
            <input type="date" value={to} onChange={e => setTo(e.target.value)} style={styles.input} />
          </div>
        </div>
        <p style={{ fontSize: '12px', color: '#888', marginBottom: '16px' }}>
          Date range khali chhodo toh saari invoices download hongi
        </p>
        <button
          style={{ ...styles.btn, opacity: loading ? 0.7 : 1 }}
          onClick={handleExport}
          disabled={loading}
        >
          {loading ? 'Downloading...' : '⬇ Download Excel'}
        </button>
        {msg && <p style={{ marginTop: '12px', fontSize: '13px', textAlign: 'center', color: msg.includes('✅') ? 'green' : 'red' }}>{msg}</p>}
      </div>
    </div>
  );
}

const styles = {
  card: { background: 'white', borderRadius: '12px', padding: '28px', boxShadow: '0 2px 16px rgba(0,0,0,0.08)', maxWidth: '500px' },
  dateRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' },
  label: { display: 'block', fontSize: '12px', fontWeight: '600', color: '#666', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' },
  input: { width: '100%', padding: '9px 12px', border: '1.5px solid #e0e0e0', borderRadius: '7px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' },
  btn: { width: '100%', padding: '13px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '7px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
};