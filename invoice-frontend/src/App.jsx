import { useState } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import InvoiceList from './pages/InvoiceList';
import InvoiceForm from './pages/InvoiceForm';
import ExcelExport from './pages/ExcelExport';

const NAV = [
  { id: 'dashboard', label: '⊞ Dashboard' },
  { id: 'new-invoice', label: '＋ New Invoice' },
  { id: 'invoice-list', label: '☰ All Invoices' },
  { id: 'excel-export', label: '⬇ Excel Export' },
];

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [page, setPage] = useState('dashboard');
  const [editInvoice, setEditInvoice] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
  };

  const goToEdit = (inv) => {
    setEditInvoice(inv);
    setPage('new-invoice');
  };

  const goToNew = () => {
    setEditInvoice(null);
    setPage('new-invoice');
  };

  const afterSave = () => {
    setEditInvoice(null);
    setPage('invoice-list');
  };

  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <div style={styles.app}>
      <div className="no-print" style={styles.sidebar}>
        <div style={styles.sidebarLogo}>
          <div style={styles.logoText}>S Four Traders</div>
          <div style={styles.logoSub}>Invoice Management</div>
        </div>
        <nav style={styles.nav}>
          {NAV.map(({ id, label }) => (
            <div key={id}
              style={{ ...styles.navItem, ...(page === id ? styles.navActive : {}) }}
              onClick={() => { if (id === 'new-invoice') goToNew(); else setPage(id); }}
            >
              {label}
            </div>
          ))}
        </nav>
        <div style={styles.sidebarFooter}>
          <button style={styles.logoutBtn} onClick={handleLogout}>← Logout</button>
        </div>
      </div>

      <div className="main-content" style={styles.main}>
        {page === 'dashboard' && <Dashboard onNew={goToNew} onViewAll={() => setPage('invoice-list')} />}
        {page === 'new-invoice' && <InvoiceForm editInvoice={editInvoice} onSave={afterSave} onBack={() => setPage(editInvoice ? 'invoice-list' : 'dashboard')} />}
        {page === 'invoice-list' && <InvoiceList onNew={goToNew} onEdit={goToEdit} />}
        {page === 'excel-export' && <ExcelExport />}
      </div>
    </div>
  );
}

const styles = {
  app: { display: 'flex', minHeight: '100vh', background: '#f0f0ee' },
  sidebar: { width: '220px', background: '#1a1a1a', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, bottom: 0, left: 0, zIndex: 100 },
  sidebarLogo: { padding: '24px 20px', borderBottom: '1px solid #333' },
  logoText: { fontFamily: 'Georgia, serif', color: '#c0272d', fontSize: '18px', fontWeight: '700' },
  logoSub: { fontSize: '10px', color: '#888', marginTop: '2px', letterSpacing: '0.5px' },
  nav: { flex: 1, padding: '16px 0' },
  navItem: { padding: '12px 20px', color: '#aaa', fontSize: '13px', fontWeight: '500', cursor: 'pointer', borderLeft: '3px solid transparent' },
  navActive: { color: 'white', background: '#2a2a2a', borderLeftColor: '#c0272d' },
  sidebarFooter: { padding: '16px 20px', borderTop: '1px solid #333' },
  logoutBtn: { width: '100%', padding: '10px', background: 'transparent', border: '1px solid #444', color: '#888', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' },
  main: { marginLeft: '220px', padding: '28px', minHeight: '100vh', flex: 1 },
};