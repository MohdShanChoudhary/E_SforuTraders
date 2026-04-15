import { useState, useEffect } from 'react';
import API from '../api';

export default function InvoiceList({ onNew, onEdit }) {
  const [invoices, setInvoices] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => { fetchInvoices(); }, []);

  const fetchInvoices = async () => {
    try {
      const res = await API.get('/api/invoices');
      setInvoices(res.data);
    } catch (err) {
      console.error('Error fetching invoices:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Invoice delete karna chahte ho?')) return;
    try {
      await API.delete(`/api/invoices/${id}`);
      setInvoices(invoices.filter(i => i.id !== id));
    } catch (err) {
      alert('Delete nahi ho saka');
    }
  };

  const handleDownloadPdf = async (inv) => {
    try {
      const res = await API.get(`/api/invoices/${inv.id}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `${inv.invoiceNo}.pdf`;
      a.click();
    } catch (err) {
      alert('PDF download nahi ho saka');
    }
  };

  const filtered = invoices.filter(i =>
    (i.billedName || '').toLowerCase().includes(search.toLowerCase()) ||
    (i.invoiceNo || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={styles.topbar}>
        <h2 style={styles.title}>All Invoices</h2>
        <div style={styles.actions}>
          <input
            style={styles.search}
            placeholder="Search party name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button style={styles.btnPrimary} onClick={onNew}>+ New Invoice</button>
        </div>
      </div>

      <div style={styles.tableWrap}>
        {loading ? (
          <p style={{ padding: '24px', textAlign: 'center', color: '#888' }}>Loading...</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                {['Invoice No.', 'Party Name', 'Date', 'Place of Supply', 'Vehicle No.', 'Grand Total', 'EWB No.', 'Actions'].map(h => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan="8" style={{ textAlign: 'center', padding: '24px', color: '#888' }}>
                  No invoices found
                </td></tr>
              ) : filtered.map(inv => (
                <tr key={inv.id} style={styles.tr}>
                  <td style={{ ...styles.td, color: '#c0272d', fontWeight: '600', fontFamily: 'monospace' }}>
                    {inv.invoiceNo}
                  </td>
                  <td style={styles.td}>{inv.billedName || '—'}</td>
                  <td style={styles.td}>{inv.invoiceDate || '—'}</td>
                  <td style={styles.td}>{inv.placeOfSupply || '—'}</td>
                  <td style={{ ...styles.td, fontFamily: 'monospace' }}>{inv.vehicleNo || '—'}</td>
                  <td style={{ ...styles.td, fontFamily: 'monospace', fontWeight: '600' }}>
                    ₹{inv.grandTotal?.toFixed(2) || '0.00'}
                  </td>
                  <td style={{ ...styles.td, fontFamily: 'monospace', fontSize: '11px' }}>
                    {inv.ewbNo || <span style={{ color: '#f59e0b', fontSize: '11px' }}>Pending</span>}
                  </td>
                  <td style={styles.td}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button style={styles.btnSm} onClick={() => onEdit(inv)}>✏ Edit</button>
                      <button style={styles.btnSm} onClick={() => handleDownloadPdf(inv)}>🖨 PDF</button>
                      <button style={{ ...styles.btnSm, background: '#fee2e2', color: '#c0272d' }}
                        onClick={() => handleDelete(inv.id)}>🗑</button>
                    </div>
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
  topbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  title: { fontFamily: 'Georgia, serif', fontSize: '24px', margin: 0 },
  actions: { display: 'flex', gap: '10px', alignItems: 'center' },
  search: {
    padding: '8px 14px', border: '1.5px solid #e0e0e0',
    borderRadius: '7px', fontSize: '13px', outline: 'none', width: '220px',
  },
  btnPrimary: {
    padding: '9px 18px', background: '#c0272d', color: 'white',
    border: 'none', borderRadius: '7px', fontSize: '13px', fontWeight: '600', cursor: 'pointer',
  },
  tableWrap: { background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 16px rgba(0,0,0,0.08)' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: {
    background: '#f4f4f4', fontSize: '11px', fontWeight: '600',
    textTransform: 'uppercase', letterSpacing: '0.5px', color: '#666',
    padding: '10px 14px', textAlign: 'left',
  },
  td: { padding: '11px 14px', fontSize: '13px', borderBottom: '1px solid #e0e0e0', verticalAlign: 'middle' },
  tr: { cursor: 'default' },
  btnSm: {
    padding: '5px 10px', background: '#f4f4f4', border: 'none',
    borderRadius: '5px', fontSize: '12px', cursor: 'pointer', fontWeight: '500',
  },
};