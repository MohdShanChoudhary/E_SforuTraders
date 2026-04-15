import { useState, useEffect } from 'react';
import API from '../api';

const STATE_CODES = {
  'Jammu & Kashmir':'01','Himachal Pradesh':'02','Punjab':'03','Chandigarh':'04',
  'Uttarakhand':'05','Haryana':'06','Delhi':'07','Rajasthan':'08','Uttar Pradesh':'09',
  'Bihar':'10','Sikkim':'11','Arunachal Pradesh':'12','Nagaland':'13','Manipur':'14',
  'Mizoram':'15','Tripura':'16','Meghalaya':'17','Assam':'18','West Bengal':'19',
  'Jharkhand':'20','Odisha':'21','Chhattisgarh':'22','Madhya Pradesh':'23','Gujarat':'24',
  'Maharashtra':'27','Andhra Pradesh':'28','Karnataka':'29','Goa':'30','Kerala':'32',
  'Tamil Nadu':'33','Puducherry':'34','Telangana':'36',
};

const emptyItem = () => ({ description: '', hsnCode: '', uom: '', quantity: '', rate: '', value: 0 });

export default function InvoiceForm({ editInvoice, onSave, onBack }) {
  const [invoiceNo, setInvoiceNo] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [reverseCharge, setReverseCharge] = useState(false);
  const [vehicleNo, setVehicleNo] = useState('');
  const [supplyDate, setSupplyDate] = useState('');
  const [placeOfSupply, setPlaceOfSupply] = useState('');
  const [billedName, setBilledName] = useState('');
  const [billedAddr, setBilledAddr] = useState('');
  const [billedPin, setBilledPin] = useState('');
  const [billedCity, setBilledCity] = useState('');
  const [billedState, setBilledState] = useState('');
  const [billedStateCode, setBilledStateCode] = useState('');
  const [billedGstin, setBilledGstin] = useState('');
  const [shippedName, setShippedName] = useState('');
  const [shippedAddr, setShippedAddr] = useState('');
  const [shippedPin, setShippedPin] = useState('');
  const [shippedCity, setShippedCity] = useState('');
  const [shippedState, setShippedState] = useState('');
  const [shippedStateCode, setShippedStateCode] = useState('');
  const [shippedGstin, setShippedGstin] = useState('');
  const [items, setItems] = useState([emptyItem(), emptyItem(), emptyItem()]);
  const [sgstRate, setSgstRate] = useState(0);
  const [cgstRate, setCgstRate] = useState(0);
  const [igstRate, setIgstRate] = useState(0);
  const [freight, setFreight] = useState(0);
  const [ewbNo, setEwbNo] = useState('');
  const [saving, setSaving] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [allInvoices, setAllInvoices] = useState([]);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    if (editInvoice) loadEditData(editInvoice);
    else fetchNextNumber();
    fetchAllInvoices();
  }, []);

  const fetchAllInvoices = async () => {
    try { const res = await API.get('/api/invoices'); setAllInvoices(res.data); } catch (e) {}
  };
  const fetchNextNumber = async () => {
    try { const res = await API.get('/api/invoices/next-number'); setInvoiceNo(res.data.invoiceNo); } catch (e) {}
  };
  const loadEditData = (inv) => {
    setInvoiceNo(inv.invoiceNo||''); setInvoiceDate(inv.invoiceDate||'');
    setReverseCharge(inv.reverseCharge||false); setVehicleNo(inv.vehicleNo||'');
    setSupplyDate(inv.supplyDate||''); setPlaceOfSupply(inv.placeOfSupply||'');
    setBilledName(inv.billedName||''); setBilledAddr(inv.billedAddr||'');
    setBilledPin(inv.billedPin||''); setBilledCity(inv.billedCity||'');
    setBilledState(inv.billedState||''); setBilledStateCode(inv.billedStateCode||'');
    setBilledGstin(inv.billedGstin||''); setShippedName(inv.shippedName||'');
    setShippedAddr(inv.shippedAddr||''); setShippedPin(inv.shippedPin||'');
    setShippedCity(inv.shippedCity||''); setShippedState(inv.shippedState||'');
    setShippedStateCode(inv.shippedStateCode||''); setShippedGstin(inv.shippedGstin||'');
    setSgstRate(inv.sgstRate||0); setCgstRate(inv.cgstRate||0);
    setIgstRate(inv.igstRate||0); setFreight(inv.freight||0);
    setEwbNo(inv.ewbNo||'');
    setItems(inv.items?.length ? inv.items : [emptyItem()]);
  };

  const fetchPincode = async (pin, prefix) => {
    if (pin.length !== 6) return;
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
      const data = await res.json();
      if (data[0].Status === 'Success') {
        const po = data[0].PostOffice[0];
        const code = STATE_CODES[po.State] || '';
        if (prefix === 'billed') {
          setBilledCity(po.District||po.Block||''); setBilledState(po.State||''); setBilledStateCode(code);
          if (!placeOfSupply) setPlaceOfSupply(po.District||po.State||'');
        } else {
          setShippedCity(po.District||po.Block||''); setShippedState(po.State||''); setShippedStateCode(code);
        }
      }
    } catch (e) {}
  };

  const decodeGstin = (gstin, prefix) => {
    const code = gstin.substring(0, 2);
    const state = Object.keys(STATE_CODES).find(k => STATE_CODES[k] === code);
    if (!state) return;
    if (prefix === 'billed') { setBilledState(state); setBilledStateCode(code); }
    else { setShippedState(state); setShippedStateCode(code); }
  };

  const showSuggestions = (val) => {
    if (!val) { setSuggestions([]); return; }
    const unique = {};
    allInvoices.forEach(inv => { if (inv.billedName) unique[inv.billedName] = inv; });
    setSuggestions(Object.values(unique).filter(inv =>
      inv.billedName.toLowerCase().includes(val.toLowerCase())).slice(0, 5));
  };

  const fillParty = (inv) => {
    setBilledName(inv.billedName||''); setBilledAddr(inv.billedAddr||'');
    setBilledPin(inv.billedPin||''); setBilledCity(inv.billedCity||'');
    setBilledState(inv.billedState||''); setBilledStateCode(inv.billedStateCode||'');
    setBilledGstin(inv.billedGstin||''); setSuggestions([]);
  };

  const updateItem = (idx, field, val) => {
    const updated = [...items];
    updated[idx] = { ...updated[idx], [field]: val };
    if (field === 'quantity' || field === 'rate') {
      const qty = parseFloat(field === 'quantity' ? val : updated[idx].quantity) || 0;
      const rate = parseFloat(field === 'rate' ? val : updated[idx].rate) || 0;
      updated[idx].value = qty * rate;
    }
    setItems(updated);
  };

  const addItem = () => setItems([...items, emptyItem()]);
  const removeItem = (idx) => setItems(items.filter((_, i) => i !== idx));

  const subtotal = items.reduce((s, i) => s + (parseFloat(i.value) || 0), 0);
  const sgstAmt = subtotal * (parseFloat(sgstRate) || 0) / 100;
  const cgstAmt = subtotal * (parseFloat(cgstRate) || 0) / 100;
  const igstAmt = subtotal * (parseFloat(igstRate) || 0) / 100;
  const grandTotal = subtotal + sgstAmt + cgstAmt + igstAmt + (parseFloat(freight) || 0);
  const setGST = (c, ss, i) => { setCgstRate(c); setSgstRate(ss); setIgstRate(i); };

  const numberToWords = (n) => {
    if (!n || n === 0) return 'Zero';
    const ones = ['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen'];
    const tens = ['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];
    const h = (n) => {
      if (n < 20) return ones[n];
      if (n < 100) return tens[Math.floor(n/10)] + (n%10 ? ' '+ones[n%10] : '');
      if (n < 1000) return ones[Math.floor(n/100)]+' Hundred'+(n%100 ? ' '+h(n%100) : '');
      if (n < 100000) return h(Math.floor(n/1000))+' Thousand'+(n%1000 ? ' '+h(n%1000) : '');
      if (n < 10000000) return h(Math.floor(n/100000))+' Lakh'+(n%100000 ? ' '+h(n%100000) : '');
      return h(Math.floor(n/10000000))+' Crore'+(n%10000000 ? ' '+h(n%10000000) : '');
    };
    return h(Math.round(n));
  };

  const handleSave = async () => {
    if (!invoiceNo || !billedName) { setSaveError('Invoice No. aur Party Name zaroori hai'); return; }
    setSaving(true); setSaveError('');
    const payload = {
      invoiceNo, invoiceDate, reverseCharge, vehicleNo, supplyDate, placeOfSupply,
      billedName, billedAddr, billedPin, billedCity, billedState, billedStateCode, billedGstin,
      shippedName, shippedAddr, shippedPin, shippedCity, shippedState, shippedStateCode, shippedGstin,
      sgstRate: parseFloat(sgstRate)||0, cgstRate: parseFloat(cgstRate)||0,
      igstRate: parseFloat(igstRate)||0, freight: parseFloat(freight)||0, ewbNo,
      items: items.filter(i => i.description).map((item, idx) => ({
        sno: idx+1, description: item.description||'', hsnCode: item.hsnCode||'',
        uom: item.uom||'', quantity: parseFloat(item.quantity)||0,
        rate: parseFloat(item.rate)||0, value: parseFloat(item.value)||0,
      })),
    };
    try {
      if (editInvoice) await API.put(`/api/invoices/${editInvoice.id}`, payload);
      else await API.post('/api/invoices', payload);
      onSave();
    } catch (err) {
      setSaveError('Error: ' + (err.response?.data?.message || err.response?.data || err.message || 'Check console F12'));
    } finally { setSaving(false); }
  };

  return (
    <>
      {/* ========== SCREEN-ONLY STYLES ========== */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700&display=swap');

        .inv-wrap { font-family: 'DM Sans', sans-serif; }

        /* Hide print-only elements on screen */
        .print-only { display: none; }

        /* Print root — invisible wrapper on screen */
        .invoice-print-root { display: contents; }

        /* =========================================
           PRINT STYLES — A4 Perfect Layout
           ========================================= */
        @media print {
          @page {
            size: A4 portrait;
            margin: 6mm 8mm 6mm 8mm;
          }

          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }

          /* Visibility trick — no blank page unlike position:fixed */
          body * { visibility: hidden !important; }
          .invoice-paper,
          .invoice-paper * { visibility: visible !important; }

          /* absolute (not fixed) so no second blank page */
          .invoice-paper {
            position: absolute !important;
            top: 0 !important; left: 0 !important; right: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            border: none !important;
            background: white !important;
            overflow: visible !important;
          }

          .no-print { display: none !important; }
          .print-only { display: inline !important; visibility: visible !important; }

          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          /* ---- Typography scale for print ---- */
          .inv-company-name { font-size: 18pt !important; }
          .inv-tax-label    { font-size: 9pt  !important; letter-spacing: 2px !important; }
          .inv-section-title{ font-size: 7pt  !important; }
          .inv-field-label  { font-size: 6pt  !important; }
          .inv-field-value  { font-size: 8pt  !important; }
          .inv-table th     { font-size: 7pt  !important; padding: 3px 4px !important; }
          .inv-table td     { font-size: 8pt  !important; padding: 2px 4px !important; line-height: 1.2 !important; }
          .inv-total-label  { font-size: 7.5pt !important; }
          .inv-total-value  { font-size: 7.5pt !important; }
          .inv-grand-label  { font-size: 9pt  !important; }
          .inv-grand-value  { font-size: 9pt  !important; }
          .inv-words-text   { font-size: 7pt  !important; }
          .inv-terms        { font-size: 6pt  !important; }
          .inv-sign-brand   { font-size: 10pt !important; }
          .inv-phone        { font-size: 8pt  !important; }
          .inv-addr         { font-size: 6.5pt !important; }

          /* Compact party boxes & meta */
          .inv-party-box { padding: 5px 8px !important; }
          .inv-meta-cell { padding: 4px 7px !important; }

          /* Footer compact */
          .inv-footer    { padding: 5px 8px !important; gap: 8px !important; }
          .inv-totals-box { min-width: 170px !important; }
          .inv-sign-row  { padding: 5px 8px !important; }

          /* No page break inside invoice */
          .invoice-paper { page-break-inside: avoid; }
        }
      `}</style>

      {/* ========== SCREEN TOP BAR ========== */}
      <div className="no-print inv-wrap" style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' }}>
        <h2 style={{ fontFamily:'Georgia,serif', fontSize:'22px', margin:0 }}>
          {editInvoice ? 'Edit Invoice' : 'New Invoice'}
        </h2>
        <button onClick={onBack} style={{ padding:'7px 14px', background:'white', border:'1.5px solid #e0e0e0', borderRadius:'7px', cursor:'pointer', fontSize:'13px' }}>
          ← Back
        </button>
      </div>

      {saveError && (
        <div className="no-print" style={{ background:'#fee2e2', color:'#c0272d', padding:'10px 16px', borderRadius:'8px', marginBottom:'12px', fontSize:'13px', maxWidth:'960px', margin:'0 auto 12px' }}>
          ❌ {saveError}
        </div>
      )}

      {/* ========== INVOICE PAPER ========== */}
      <div className="invoice-print-root">
      <div className="invoice-paper" style={{
        background:'white', borderRadius:'10px',
        boxShadow:'0 4px 24px rgba(0,0,0,0.1)',
        overflow:'hidden', maxWidth:'960px', margin:'0 auto',
        border:'1px solid #e0e0e0'
      }}>

        {/* ── HEADER ── */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr auto 1fr', alignItems:'center', padding:'10px 16px', borderBottom:'3px solid #c0272d', background:'white' }}>
          <div>
            <div className="inv-field-label" style={{ fontSize:'10px', color:'#888', fontFamily:'monospace', marginBottom:'2px' }}>
              GSTIN: 09AGOPA6566D2Z9
            </div>
            <div className="inv-company-name" style={{ fontFamily:'Georgia,serif', color:'#c0272d', fontSize:'26px', fontWeight:'800', lineHeight:1 }}>
              S Four Traders
            </div>
            <div className="inv-addr" style={{ fontSize:'10px', color:'#555', marginTop:'3px' }}>
              Opp. Vardhman Refractory, Shamli Bypass Road, Muzaffarnagar (U.P.)
            </div>
          </div>

          <div style={{ textAlign:'center', padding:'0 20px' }}>
            <div className="inv-tax-label" style={{ fontSize:'12px', fontWeight:'800', letterSpacing:'4px', textTransform:'uppercase', background:'#1a1a1a', color:'white', padding:'7px 18px', borderRadius:'4px' }}>
              TAX INVOICE
            </div>
          </div>

          <div style={{ textAlign:'right' }}>
            <div className="inv-phone" style={{ fontWeight:'800', fontSize:'15px', color:'#1a1a1a' }}>📞 8279444622</div>
            <div className="inv-field-label" style={{ fontSize:'10px', color:'#888', marginTop:'3px' }}>State: Uttar Pradesh | Code: 09</div>
          </div>
        </div>

        {/* ── META STRIP ── */}
        <div style={{ display:'flex', borderBottom:'1px solid #e0e0e0', background:'#fafafa' }}>
          {[
            { label:'Invoice No.', content: <input className="inv-field-value" style={metaInputStyle} value={invoiceNo} onChange={e => setInvoiceNo(e.target.value)} /> },
            { label:'Date', content: <input className="inv-field-value" style={metaInputStyle} type="date" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)} /> },
            { label:'Vehicle No.', content: <input className="inv-field-value" style={metaInputStyle} value={vehicleNo} onChange={e => setVehicleNo(e.target.value)} placeholder="UP14CD-1234" /> },
            { label:'Date & Time of Supply', content: <input className="inv-field-value" style={metaInputStyle} type="datetime-local" value={supplyDate} onChange={e => setSupplyDate(e.target.value)} /> },
            { label:'Place of Supply', content: <input className="inv-field-value" style={metaInputStyle} value={placeOfSupply} onChange={e => setPlaceOfSupply(e.target.value)} placeholder="Dehradun" /> },
            { label:'Reverse Charge', content: (
              <label style={{ display:'flex', alignItems:'center', gap:'4px', fontSize:'11px' }}>
                <input type="checkbox" checked={reverseCharge} onChange={e => setReverseCharge(e.target.checked)} />
                <span className="inv-field-value">{reverseCharge ? 'Yes' : 'No'}</span>
              </label>
            )},
          ].map((cell, i, arr) => (
            <div key={i} className="inv-meta-cell" style={{ flex:1, padding:'8px 10px', borderRight: i < arr.length-1 ? '1px solid #e0e0e0' : 'none' }}>
              <div className="inv-field-label" style={{ fontSize:'9px', fontWeight:'700', color:'#888', textTransform:'uppercase', letterSpacing:'0.3px', marginBottom:'3px' }}>{cell.label}</div>
              {cell.content}
            </div>
          ))}
        </div>

        {/* ── PARTY ROW ── */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', borderBottom:'1px solid #e0e0e0' }}>
          {/* Billed To */}
          <div className="inv-party-box" style={{ padding:'10px 14px', borderRight:'1px solid #e0e0e0' }}>
            <div className="inv-section-title" style={{ fontSize:'9px', fontWeight:'800', color:'#c0272d', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'8px', paddingBottom:'4px', borderBottom:'1px solid #f0d0d0' }}>
              Details of Receiver / Billed To
            </div>
            <div style={{ position:'relative' }}>
              <CF label="Name" value={billedName}
                onChange={e => { setBilledName(e.target.value); showSuggestions(e.target.value); }}
                onBlur={() => setTimeout(() => setSuggestions([]), 200)} placeholder="Party Name" />
              {suggestions.length > 0 && (
                <div style={{ position:'absolute', top:'100%', left:0, right:0, background:'white', border:'1.5px solid #c0272d', borderRadius:'6px', zIndex:50, boxShadow:'0 4px 16px rgba(0,0,0,0.1)', maxHeight:'160px', overflowY:'auto' }}>
                  {suggestions.map(inv => (
                    <div key={inv.id} style={{ padding:'7px 12px', cursor:'pointer', borderBottom:'1px solid #eee', fontSize:'12px' }}
                      onMouseDown={() => fillParty(inv)}>
                      <b>{inv.billedName}</b>
                      <span style={{ fontSize:'10px', color:'#888', fontFamily:'monospace' }}> {inv.billedGstin}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <CF label="Address" value={billedAddr} onChange={e => setBilledAddr(e.target.value)} />
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'6px' }}>
              <CF label="Pincode" value={billedPin} onChange={e => { setBilledPin(e.target.value); fetchPincode(e.target.value,'billed'); }} maxLength={6} placeholder="6 digits" />
              <CF label="City" value={billedCity} onChange={e => setBilledCity(e.target.value)} />
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'6px' }}>
              <CF label="State" value={billedState} onChange={e => setBilledState(e.target.value)} />
              <CF label="Code" value={billedStateCode} onChange={e => setBilledStateCode(e.target.value)} />
              <CF label="GSTIN" value={billedGstin}
                onChange={e => { const v=e.target.value.toUpperCase(); setBilledGstin(v); if(v.length===15) decodeGstin(v,'billed'); }}
                maxLength={15} placeholder="15 chars" />
            </div>
          </div>

          {/* Shipped To */}
          <div className="inv-party-box" style={{ padding:'10px 14px' }}>
            <div className="inv-section-title" style={{ fontSize:'9px', fontWeight:'800', color:'#c0272d', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'8px', paddingBottom:'4px', borderBottom:'1px solid #f0d0d0' }}>
              Details of Consignee / Shipped To
            </div>
            <CF label="Name" value={shippedName} onChange={e => setShippedName(e.target.value)} placeholder="If different" />
            <CF label="Address" value={shippedAddr} onChange={e => setShippedAddr(e.target.value)} />
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'6px' }}>
              <CF label="Pincode" value={shippedPin} onChange={e => { setShippedPin(e.target.value); fetchPincode(e.target.value,'shipped'); }} maxLength={6} placeholder="6 digits" />
              <CF label="City" value={shippedCity} onChange={e => setShippedCity(e.target.value)} />
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'6px' }}>
              <CF label="State" value={shippedState} onChange={e => setShippedState(e.target.value)} />
              <CF label="Code" value={shippedStateCode} onChange={e => setShippedStateCode(e.target.value)} />
              <CF label="GSTIN" value={shippedGstin}
                onChange={e => { const v=e.target.value.toUpperCase(); setShippedGstin(v); if(v.length===15) decodeGstin(v,'shipped'); }}
                maxLength={15} placeholder="15 chars" />
            </div>
          </div>
        </div>

        {/* ── GST QUICK BAR (screen only) ── */}
        <div className="no-print" style={{ display:'flex', alignItems:'center', gap:'5px', flexWrap:'wrap', padding:'7px 14px', background:'#fdf6e3', borderBottom:'1px solid #e8d89a' }}>
          <span style={{ fontSize:'11px', fontWeight:'700', color:'#666', marginRight:'4px' }}>Quick GST:</span>
          {[['0%',0,0,0],['5%',2.5,2.5,0],['12%',6,6,0],['18%',9,9,0],['28%',14,14,0],
            ['5% IGST',0,0,5],['12% IGST',0,0,12],['18% IGST',0,0,18],['28% IGST',0,0,28]].map(([l,c,ss,i]) => (
            <button key={l} onClick={() => setGST(c,ss,i)}
              style={{ padding:'3px 9px', borderRadius:'20px', border:'1px solid #c9a84c', background:'white', fontSize:'11px', fontWeight:'600', color:'#854d0e', cursor:'pointer' }}>
              {l}
            </button>
          ))}
        </div>

        {/* ── ITEMS TABLE ── */}
        <table className="inv-table" style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead>
            <tr style={{ background:'#1a1a1a' }}>
              {['S.No','Description of Goods','HSN Code','UOM','Qty','Rate (₹)','Value (₹)',''].map((h,i) => (
                <th key={i} style={{ color:'white', fontSize:'10px', fontWeight:'700', textTransform:'uppercase', padding:'7px 6px', textAlign:'center', letterSpacing:'0.3px' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={idx} style={{ borderBottom:'1px solid #ececec', background: idx%2===0 ? 'white' : '#fafafa' }}>
                <td style={{ padding:'4px 6px', textAlign:'center', color:'#aaa', fontSize:'11px', width:'36px' }}>{idx+1}</td>
                <td style={{ padding:'4px 6px' }}>
                  <input style={{ width:'100%', border:'none', background:'transparent', fontSize:'12px', outline:'none', textAlign:'left' }}
                    value={item.description} onChange={e => updateItem(idx,'description',e.target.value)} placeholder="Description of goods" />
                </td>
                <td style={{ padding:'4px 6px', width:'70px' }}>
                  <input style={{ width:'100%', border:'none', background:'transparent', fontSize:'12px', outline:'none', textAlign:'center' }}
                    value={item.hsnCode} onChange={e => updateItem(idx,'hsnCode',e.target.value)} />
                </td>
                <td style={{ padding:'4px 6px', width:'50px' }}>
                  <input style={{ width:'100%', border:'none', background:'transparent', fontSize:'12px', outline:'none', textAlign:'center' }}
                    value={item.uom} onChange={e => updateItem(idx,'uom',e.target.value)} />
                </td>
                <td style={{ padding:'4px 6px', width:'60px' }}>
                  <input style={{ width:'100%', border:'none', background:'transparent', fontSize:'12px', outline:'none', textAlign:'center' }}
                    type="number" value={item.quantity} onChange={e => updateItem(idx,'quantity',e.target.value)} />
                </td>
                <td style={{ padding:'4px 6px', width:'80px' }}>
                  <input style={{ width:'100%', border:'none', background:'transparent', fontSize:'12px', outline:'none', textAlign:'right' }}
                    type="number" value={item.rate} onChange={e => updateItem(idx,'rate',e.target.value)} />
                </td>
                <td style={{ padding:'4px 6px', width:'90px', fontFamily:'monospace', textAlign:'right', fontWeight:'600', color:'#333' }}>
                  {(parseFloat(item.value)||0).toFixed(2)}
                </td>
                <td style={{ padding:'4px 4px', width:'28px', textAlign:'center' }} className="no-print">
                  <button onClick={() => removeItem(idx)} style={{ background:'none', border:'none', cursor:'pointer', color:'#c0272d', fontSize:'16px', lineHeight:1 }}>×</button>
                </td>
              </tr>
            ))}

            {/* Empty filler rows for print — always show at least 8 rows total */}
            {Array.from({ length: Math.max(0, 8 - items.length) }).map((_, i) => (
              <tr key={'e'+i} style={{ borderBottom:'1px solid #ececec', background: (items.length+i)%2===0 ? 'white' : '#fafafa' }}>
                <td style={{ padding:'4px 6px', height:'22px' }}></td>
                <td></td><td></td><td></td><td></td><td></td><td></td>
                <td className="no-print"></td>
              </tr>
            ))}

            {/* Subtotal row */}
            <tr style={{ background:'#f0f0f0', borderTop:'2px solid #1a1a1a' }}>
              <td colSpan="5" style={{ padding:'6px 8px', textAlign:'right', fontWeight:'700', fontSize:'11px', color:'#333', textTransform:'uppercase', letterSpacing:'0.5px' }}>
                Sub Total
              </td>
              <td></td>
              <td style={{ padding:'6px 8px', fontFamily:'monospace', fontWeight:'800', fontSize:'12px', textAlign:'right', color:'#1a1a1a' }}>
                ₹{subtotal.toFixed(2)}
              </td>
              <td className="no-print"></td>
            </tr>
          </tbody>
        </table>

        <button className="no-print" onClick={addItem}
          style={{ margin:'6px 14px', fontSize:'11px', color:'#c0272d', background:'none', border:'1px dashed #c0272d', padding:'4px 12px', borderRadius:'5px', cursor:'pointer' }}>
          + Add Item
        </button>

        {/* ── FOOTER: Words + Totals ── */}
        <div className="inv-footer" style={{ display:'flex', gap:'16px', padding:'10px 14px', borderTop:'2px solid #e0e0e0', alignItems:'stretch' }}>
          {/* Left: Words + EWB */}
          <div style={{ flex:1 }}>
            <div className="inv-field-label" style={{ fontSize:'9px', fontWeight:'700', color:'#666', textTransform:'uppercase', marginBottom:'4px' }}>
              Total Invoice Amount in Words
            </div>
            <div className="inv-words-text" style={{ fontSize:'11px', fontWeight:'600', background:'#fdf6e3', border:'1px solid #e8d89a', borderRadius:'4px', padding:'6px 8px', minHeight:'32px' }}>
              {numberToWords(Math.round(grandTotal))} Rupees Only
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:'6px', marginTop:'8px' }}>
              <b className="inv-field-label" style={{ fontSize:'10px', color:'#555', whiteSpace:'nowrap' }}>E-Way Bill No.:</b>
              <input style={{ flex:1, border:'none', borderBottom:'1px solid #ddd', fontFamily:'monospace', fontSize:'11px', outline:'none', background:'transparent' }}
                value={ewbNo} onChange={e => setEwbNo(e.target.value)} placeholder="Will be generated" />
            </div>
          </div>

          {/* Right: Totals Box */}
          <div className="inv-totals-box" style={{ minWidth:'220px', border:'1.5px solid #e0e0e0', borderRadius:'6px', overflow:'hidden', flexShrink:0 }}>
            {[
              ['Taxable Amount', subtotal.toFixed(2)],
              [`SGST @ ${sgstRate}%`, sgstAmt.toFixed(2)],
              [`CGST @ ${cgstRate}%`, cgstAmt.toFixed(2)],
              [`IGST @ ${igstRate}%`, igstAmt.toFixed(2)],
            ].map(([label, val], i) => (
              <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'5px 10px', fontSize:'11px', borderBottom:'1px solid #eee', background: i%2===0 ? 'white':'#fafafa' }}>
                <span className="inv-total-label" style={{ color:'#555' }}>{label}</span>
                <span className="inv-total-value" style={{ fontFamily:'monospace', fontWeight:'600' }}>₹{val}</span>
              </div>
            ))}
            {/* Freight editable */}
            <div style={{ display:'flex', justifyContent:'space-between', padding:'5px 10px', fontSize:'11px', borderBottom:'1px solid #eee', alignItems:'center' }}>
              <span className="inv-total-label" style={{ color:'#555' }}>Freight</span>
              <input type="number" value={freight} onChange={e => setFreight(e.target.value)}
                className="no-print"
                style={{ width:'80px', border:'none', borderBottom:'1px solid #ddd', textAlign:'right', fontFamily:'monospace', fontSize:'11px', outline:'none', background:'transparent' }} />
              <span className="inv-total-value print-only" style={{ fontFamily:'monospace', fontWeight:'600' }}>₹{(parseFloat(freight)||0).toFixed(2)}</span>
            </div>
            {/* Grand Total */}
            <div style={{ display:'flex', justifyContent:'space-between', padding:'8px 10px', background:'#1a1a1a', color:'white' }}>
              <span className="inv-grand-label" style={{ fontWeight:'700', fontSize:'12px', letterSpacing:'0.5px' }}>Grand Total</span>
              <span className="inv-grand-value" style={{ fontFamily:'monospace', fontWeight:'800', fontSize:'13px' }}>₹{grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* ── SIGNATURE ROW ── */}
        <div className="inv-sign-row" style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', padding:'10px 14px', borderTop:'1px solid #e0e0e0' }}>
          <div className="inv-terms" style={{ fontSize:'9px', color:'#555', lineHeight:'1.9', maxWidth:'60%' }}>
            <b style={{ display:'block', marginBottom:'2px', fontSize:'10px', color:'#333' }}>Terms & Conditions</b>
            • Goods once sold will not be taken back.<br/>
            • All Disputes Subject to Muzaffarnagar Jurisdiction Only.<br/>
            • E &amp; O.E.
          </div>
          <div style={{ textAlign:'right' }}>
            <div className="inv-terms" style={{ fontSize:'9px', color:'#777' }}>
              Certified that the particulars given above are true &amp; correct.
            </div>
            <div className="inv-sign-brand" style={{ fontFamily:'Georgia,serif', color:'#c0272d', fontSize:'15px', fontWeight:'800', marginTop:'4px' }}>
              For S Four Traders
            </div>
            <div className="inv-terms" style={{ fontSize:'9px', color:'#999', marginTop:'28px', borderTop:'1px solid #ddd', paddingTop:'3px' }}>
              Prop. / Authorised Signatory
            </div>
          </div>
        </div>
      </div>{/* end invoice-paper */}
      </div>{/* end invoice-print-root */}

      {/* ── ACTION BUTTONS ── */}
      <div className="no-print" style={{ display:'flex', gap:'10px', justifyContent:'flex-end', alignItems:'center', marginTop:'14px', maxWidth:'960px', margin:'14px auto 0' }}>
        {saveError && <span style={{ color:'#c0272d', fontSize:'12px', flex:1 }}>❌ {saveError}</span>}
        <button onClick={() => window.print()}
          style={{ padding:'9px 20px', background:'white', color:'#333', border:'1.5px solid #e0e0e0', borderRadius:'7px', fontSize:'13px', cursor:'pointer' }}>
          🖨 Print
        </button>
        <button onClick={handleSave} disabled={saving}
          style={{ padding:'9px 20px', background:'#c0272d', color:'white', border:'none', borderRadius:'7px', fontSize:'13px', fontWeight:'600', cursor:'pointer', opacity:saving?0.7:1 }}>
          {saving ? 'Saving...' : editInvoice ? '💾 Update' : '💾 Save Invoice'}
        </button>
      </div>
    </>
  );
}

// ── Compact Field Component ──
function CF({ label, value, onChange, type='text', placeholder, maxLength, onBlur }) {
  return (
    <div style={{ marginBottom:'6px' }}>
      <div className="inv-field-label" style={{ fontSize:'9px', fontWeight:'700', color:'#888', textTransform:'uppercase', letterSpacing:'0.3px', marginBottom:'2px' }}>{label}</div>
      <input type={type} value={value} onChange={onChange} placeholder={placeholder}
        maxLength={maxLength} onBlur={onBlur} className="inv-field-value"
        style={{ width:'100%', border:'none', borderBottom:'1px solid #e0e0e0', padding:'3px 2px', fontSize:'12px', outline:'none', background:'transparent', boxSizing:'border-box' }} />
    </div>
  );
}

// ── Shared input style ──
const metaInputStyle = {
  width:'100%', border:'none', background:'transparent',
  fontSize:'12px', outline:'none', fontFamily:'inherit',
  fontWeight:'600', color:'#1a1a1a',
};