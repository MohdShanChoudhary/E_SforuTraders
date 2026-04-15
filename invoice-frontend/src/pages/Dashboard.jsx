import { useState, useEffect } from 'react';
import API from '../api';

export default function Dashboard({ onNew, onViewAll }) {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/api/invoices').then(res => {
      setInvoices(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const totalAmt = invoices.reduce((s, i) => s + (i.grandTotal || 0), 0);
  const ewbCount = invoices.filter(i => i.ewbNo).length;
  const thisMonth = invoices.filter(i => {
    if (!i.invoiceDate) return false;
    const d = new Date(i.invoiceDate), now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  return (
    <div>
      <div style={styles.topbar}>
        <h2 style={styles.title}>Dashboard</h2>
        <button style={styles.btnPrimary} onClick={onNew}>+ New Invoice</button>
      </div>

      <div style={styles.statsGrid}>
        {[
          { label: 'Total Invoices', value: invoices.length, sub: 'All time', color: '#c0272d' },
          { label: 'E-Way Bills', value: ewbCount, sub: 'Generated', color: '#c9a84c' },
          { label: 'This Month', value: thisMonth, sub: 'Invoices', color: '#1a1a1a' },
          { label: 'Total Amount', value: `₹${Math.round(totalAmt).toLocaleString('en-IN')}`, sub: 'Grand total', color: '#1a1a1a' },
        ].map(({ label, value, sub, color }) => (
          <div key={label} style={{ ...styles.statCard, borderTop: `3px solid ${color}` }}>
            <div style={styles.statLabel}>{label}</div>
            <div style={{ ...styles.statValue, fontFamily: 'Georgia, serif' }}>{value}</div>
            <div style={styles.statSub}>{sub}</div>
          </div>
        ))}
      </div>

      <div style={styles.tableWrap}>
        <div style={styles.tableHead}>
          <h3 style={{ margin: 0, fontSize: '14px' }}>Recent Invoices</h3>
          <button style={styles.btnSm} onClick={onViewAll}>View All →</button>
        </div>
        {loading ? (
          <p style={{ padding: '24px', textAlign: 'center', color: '#888' }}>Loading...</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                {['Invoice No.', 'Party Name', 'Date', 'Amount', 'EWB Status'].map(h => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {invoices.slice(0, 5).length === 0 ? (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: '#888' }}>
                  No invoices yet. Create your first invoice!
                </td></tr>
              ) : invoices.slice(0, 5).map(inv => (
                <tr key={inv.id}>
                  <td style={{ ...styles.td, color: '#c0272d', fontWeight: '600', fontFamily: 'monospace' }}>{inv.invoiceNo}</td>
                  <td style={styles.td}>{inv.billedName || '—'}</td>
                  <td style={styles.td}>{inv.invoiceDate || '—'}</td>
                  <td style={{ ...styles.td, fontFamily: 'monospace', fontWeight: '600' }}>₹{inv.grandTotal?.toFixed(2) || '0.00'}</td>
                  <td style={styles.td}>
                    <span style={{
                      padding: '3px 9px', borderRadius: '20px', fontSize: '11px', fontWeight: '600',
                      background: inv.ewbNo ? '#dcfce7' : '#fef9c3',
                      color: inv.ewbNo ? '#15803d' : '#854d0e',
                    }}>
                      {inv.ewbNo ? 'Generated' : 'Pending'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

const styles = {
  topbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  title: { fontFamily: 'Georgia, serif', fontSize: '24px', margin: 0 },
  btnPrimary: { padding: '9px 18px', background: '#c0272d', color: 'white', border: 'none', borderRadius: '7px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },
  btnSm: { padding: '6px 14px', background: 'white', border: '1.5px solid #e0e0e0', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px', marginBottom: '24px' },
  statCard: { background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 16px rgba(0,0,0,0.08)' },
  statLabel: { fontSize: '11px', fontWeight: '600', color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' },
  statValue: { fontSize: '26px', fontWeight: '700', color: '#1a1a1a' },
  statSub: { fontSize: '12px', color: '#888', marginTop: '4px' },
  tableWrap: { background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 16px rgba(0,0,0,0.08)' },
  tableHead: { padding: '16px 20px', borderBottom: '1px solid #e0e0e0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { background: '#f4f4f4', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#666', padding: '10px 14px', textAlign: 'left' },
  td: { padding: '11px 14px', fontSize: '13px', borderBottom: '1px solid #e0e0e0' },
};