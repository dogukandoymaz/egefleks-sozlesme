import { useState, useEffect, useRef } from 'react';
import { Storage } from '../utils/storage';
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  Trash, 
  User, 
  FileSpreadsheet, 
  FileText,
  Edit2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import confetti from 'canvas-confetti';

// Simple Canvas-based Signature Component
function SignaturePad({ title, onSave, savedImage }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(!!savedImage);
  const [mode, setMode] = useState(savedImage ? 'preview' : 'draw');

  useEffect(() => {
    if (mode === 'draw' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }
  }, [mode]);

  const startDrawing = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const pos = getMousePos(canvas, e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    e.preventDefault();
    if (!isDrawing || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const pos = getMousePos(canvas, e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    saveSignature();
  };

  const getMousePos = (canvas, evt) => {
    const rect = canvas.getBoundingClientRect();
    const clientX = evt.touches ? evt.touches[0].clientX : evt.clientX;
    const clientY = evt.touches ? evt.touches[0].clientY : evt.clientY;
    
    // Scale position to match canvas internal width/height
    return {
      x: ((clientX - rect.left) / rect.width) * canvas.width,
      y: ((clientY - rect.top) / rect.height) * canvas.height
    };
  };

  const clearCanvas = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    onSave('');
  };

  const saveSignature = () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL();
    onSave(dataUrl);
  };

  const handleReSign = () => {
    setMode('draw');
    setHasSignature(false);
    onSave('');
  };

  return (
    <div className="signature-container">
      <div className="signature-header">
        <h4>{title}</h4>
        {mode === 'draw' && hasSignature && (
          <button type="button" className="btn btn-secondary" style={{ padding: '2px 8px', fontSize: '11px' }} onClick={clearCanvas}>
            Temizle
          </button>
        )}
        {mode === 'preview' && (
          <button type="button" className="btn btn-secondary" style={{ padding: '2px 8px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }} onClick={handleReSign}>
            <Edit2 size={10} /> Yeniden İmzala
          </button>
        )}
      </div>

      <div className="signature-canvas-wrapper">
        {mode === 'preview' && savedImage ? (
          <img src={savedImage} alt={title} className="signature-preview-img" />
        ) : (
          <canvas
            ref={canvasRef}
            width={400}
            height={150}
            className="signature-canvas"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
        )}
      </div>
    </div>
  );
}

export default function ContractForm({ contract, prefillData, onBack }) {
  const [catalog, setCatalog] = useState(() => Storage.getCatalog());

  // Form Fields
  const [contractNumber, setContractNumber] = useState(() => {
    if (contract) return contract.contractNumber || '';
    const contracts = Storage.getContracts();
    const maxNo = contracts.reduce((max, c) => Number(c.contractNumber) > max ? Number(c.contractNumber) : max, 1007);
    return (maxNo + 1).toString();
  });
  const [customerName, setCustomerName] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [installationAddress, setInstallationAddress] = useState('');
  const [date, setDate] = useState(new Date().toISOString().substring(0, 10));
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [taxOffice, setTaxOffice] = useState('');
  const [taxNo, setTaxNo] = useState('');
  const [tcNo, setTcNo] = useState('');
  const [showAdditionalDetails, setShowAdditionalDetails] = useState(false);
  const [discountType, setDiscountType] = useState('percentage'); // 'percentage' | 'amount'
  const [discountValue, setDiscountValue] = useState(0);

  // Items List
  const [items, setItems] = useState([
    { id: '1', name: '', unit: 'm²', qty: 0, priceExcl: 0, priceIncl: 0, total: 0, totalExcl: 0, kdv: 0, kdvAmount: 0 }
  ]);

  // Project details
  const [apartmentStatus, setApartmentStatus] = useState('bos');
  const [floorStatus, setFloorStatus] = useState('');
  const [description, setDescription] = useState('');

  // Payment fields
  const [payments, setPayments] = useState([]);
  const [deliveryDate, setDeliveryDate] = useState('');
  const [status, setStatus] = useState('hazirlaniyor');

  // Signatures
  const [customerSignature, setCustomerSignature] = useState('');
  const [salesRepSignature, setSalesRepSignature] = useState('');

  const handlePaymentChange = (index, field, value) => {
    const newPayments = [...payments];
    newPayments[index][field] = value;
    setPayments(newPayments);
  };

  const addPaymentRow = () => {
    setPayments([
      ...payments,
      {
        id: Date.now().toString() + Math.random().toString().substring(2, 7),
        amount: 0,
        method: 'Nakit',
        date: new Date().toISOString().substring(0, 10),
        description: ''
      }
    ]);
  };

  const removePaymentRow = (index) => {
    setPayments(payments.filter((_, idx) => idx !== index));
  };

  useEffect(() => {
    if (contract) {
      if (contract.contractNumber) setContractNumber(contract.contractNumber.toString());
      setCustomerName(contract.customerName || '');
      setBillingAddress(contract.billingAddress || '');
      setInstallationAddress(contract.installationAddress || '');
      if (contract.date) setDate(contract.date.substring(0, 10));
      setPhone(contract.phone || '');
      setEmail(contract.email || '');
      setTaxOffice(contract.taxOffice || '');
      setTaxNo(contract.taxNo || '');
      setTcNo(contract.tcNo || '');
      
      // Auto-show additional details if any of them are populated in the database
      if (contract.email || contract.tcNo || contract.taxOffice || contract.taxNo || contract.billingAddress) {
        setShowAdditionalDetails(true);
      } else {
        setShowAdditionalDetails(false);
      }
      const loadedItems = contract.items?.map(item => ({
        ...item,
        kdv: item.kdv !== undefined ? Number(item.kdv) : 0,
        priceExcl: item.priceExcl !== undefined ? item.priceExcl : (item.price || 0),
        priceIncl: item.priceIncl !== undefined ? item.priceIncl : (item.price || 0),
        totalExcl: item.totalExcl !== undefined ? item.totalExcl : (item.total || 0),
        kdvAmount: item.kdvAmount !== undefined ? item.kdvAmount : 0
      })) || [{ id: '1', name: '', unit: 'm²', qty: 0, priceExcl: 0, priceIncl: 0, total: 0, totalExcl: 0, kdv: 0, kdvAmount: 0 }];
      setItems(loadedItems);
      setApartmentStatus(contract.apartmentStatus || 'bos');
      setFloorStatus(contract.floorStatus || '');
      setDescription(contract.description || '');
      setDiscountType(contract.discountType || 'percentage');
      setDiscountValue(contract.discountValue || 0);
      
      // Handle payments migration
      let loadedPayments = contract.payments || [];
      if (loadedPayments.length === 0) {
        if (contract.cashPayment && contract.cashPayment > 0) {
          loadedPayments.push({
            id: 'legacy_cash_' + Date.now(),
            amount: contract.cashPayment,
            method: 'Nakit',
            date: contract.date ? contract.date.substring(0, 10) : new Date().toISOString().substring(0, 10),
            description: 'Nakit Tahsilat (Eski Kayıt)'
          });
        }
        if (contract.cardPayment && contract.cardPayment > 0) {
          loadedPayments.push({
            id: 'legacy_card_' + Date.now(),
            amount: contract.cardPayment,
            method: 'Kredi Kartı',
            date: contract.date ? contract.date.substring(0, 10) : new Date().toISOString().substring(0, 10),
            description: 'Kart Tahsilat (Eski Kayıt)'
          });
        }
      }
      setPayments(loadedPayments);
      
      if (contract.deliveryDate) setDeliveryDate(contract.deliveryDate.substring(0, 10));
      setStatus(contract.status || 'hazirlaniyor');
      setCustomerSignature(contract.customerSignature || '');
      setSalesRepSignature(contract.salesRepSignature || '');
    }
  }, [contract]);

  useEffect(() => {
    if (prefillData && !contract) {
      if (prefillData.items) {
        setItems(prefillData.items);
      }
      if (prefillData.description) {
        setDescription(prefillData.description);
      }
    }
  }, [prefillData, contract]);

  // Handle Calculations
  const subtotalIncl = items.reduce((sum, item) => sum + (item.total || 0), 0);
  const subtotalExcl = items.reduce((sum, item) => sum + (item.totalExcl || 0), 0);
  const totalKdv = items.reduce((sum, item) => sum + (item.kdvAmount || 0), 0);

  const kdv10Total = items.reduce((sum, item) => Number(item.kdv || 0) === 10 ? sum + (item.kdvAmount || 0) : sum, 0);
  const kdv20Total = items.reduce((sum, item) => Number(item.kdv || 0) === 20 ? sum + (item.kdvAmount || 0) : sum, 0);

  const discountAmount = discountType === 'percentage' 
    ? (subtotalIncl * (Number(discountValue) || 0) / 100) 
    : (Number(discountValue) || 0);

  const total = Math.max(0, subtotalIncl - discountAmount);
  const totalPaid = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const remaining = Math.max(0, total - totalPaid);

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    const item = newItems[index];

    // If KDV is selected, parse to number
    const val = field === 'kdv' ? Number(value) : value;
    item[field] = val;

    const kdvRate = Number(item.kdv || 0);

    if (field === 'name') {
      const selectedProduct = catalog.find(p => p.name.toLowerCase() === value.toLowerCase());
      if (selectedProduct) {
        item.unit = selectedProduct.unit;
        // Catalog default price is KDV Hariç
        item.priceExcl = selectedProduct.defaultPrice;
        item.priceIncl = selectedProduct.defaultPrice * (1 + kdvRate / 100);
      }
    } else if (field === 'kdv') {
      item.priceIncl = Number(item.priceExcl || 0) * (1 + kdvRate / 100);
    } else if (field === 'priceExcl') {
      item.priceIncl = Number(value || 0) * (1 + kdvRate / 100);
    } else if (field === 'priceIncl') {
      item.priceExcl = Number(value || 0) / (1 + kdvRate / 100);
    } else if (field === 'total') {
      const qty = Number(item.qty || 0);
      const totalVal = Number(value || 0);
      item.total = totalVal;
      if (qty > 0) {
        item.priceIncl = totalVal / qty;
      } else {
        item.priceIncl = totalVal;
      }
      item.priceExcl = item.priceIncl / (1 + kdvRate / 100);
      item.totalExcl = qty > 0 ? (item.priceExcl * qty) : item.priceExcl;
      item.kdvAmount = item.total - item.totalExcl;
      setItems(newItems);
      return;
    }

    // Always update total based on qty and price
    item.total = Number(item.qty || 0) * Number(item.priceIncl || 0);
    item.totalExcl = Number(item.qty || 0) * Number(item.priceExcl || 0);
    item.kdvAmount = item.total - item.totalExcl;

    setItems(newItems);
  };

  const addItemRow = () => {
    setItems([
      ...items,
      { id: Date.now().toString(), name: '', unit: 'm²', qty: 0, priceExcl: 0, priceIncl: 0, total: 0, totalExcl: 0, kdv: 0, kdvAmount: 0 }
    ]);
  };

  const removeItemRow = (index) => {
    if (items.length === 1) {
      setItems([{ id: '1', name: '', unit: 'm²', qty: 0, priceExcl: 0, priceIncl: 0, total: 0, totalExcl: 0, kdv: 0, kdvAmount: 0 }]);
    } else {
      setItems(items.filter((_, idx) => idx !== index));
    }
  };

  const handleQuickSaveToCatalog = (index) => {
    const item = items[index];
    if (!item.name.trim()) return;

    // Check if it already exists to avoid duplicate entries
    const currentCatalog = Storage.getCatalog();
    const exists = currentCatalog.some(cat => cat.name.toLowerCase() === item.name.trim().toLowerCase());
    if (exists) {
      alert('Bu ürün zaten katalogda mevcut.');
      setCatalog(currentCatalog);
      return;
    }

    // Save to storage
    Storage.addCatalogItem({
      name: item.name.trim(),
      unit: item.unit || 'm²',
      defaultPrice: item.priceIncl || 0
    });

    // Update state to refresh datalist & hide button
    const updatedCatalog = Storage.getCatalog();
    setCatalog(updatedCatalog);
    alert(`"${item.name.trim()}" başarıyla kataloğa kaydedildi!`);
  };
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!customerName) {
      alert('Lütfen müşteri adını girin.');
      return;
    }
    const calculatedCashPayment = payments
      .filter(p => p.method === 'Nakit')
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    const calculatedCardPayment = payments
      .filter(p => p.method !== 'Nakit')
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

    Storage.saveContract({
      id: contract?.id,
      contractNumber: contractNumber,
      customerName,
      billingAddress,
      installationAddress,
      date,
      phone,
      email,
      taxOffice,
      taxNo,
      tcNo,
      items: items.filter(item => item.name !== ''), // Filter out empty lines
      apartmentStatus,
      floorStatus,
      description,
      discountType,
      discountValue: Number(discountValue),
      discountAmount,
      subtotal: subtotalIncl,
      subtotalExcl,
      totalKdv,
      total,
      payments: payments.filter(p => Number(p.amount) > 0 || p.description.trim() !== ''),
      cashPayment: calculatedCashPayment,
      cardPayment: calculatedCardPayment,
      remaining,
      deliveryDate,
      status,
      customerSignature,
      salesRepSignature
    });

    // Run premium success animation (Confetti!)
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#059669', '#d97706', '#10b981']
    });

    onBack(true);
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(val);
  };

  return (
    <div>
      {/* Top bar with back option */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <button className="btn btn-secondary btn-icon-only" onClick={onBack}>
          <ArrowLeft size={18} />
        </button>
        <h2 style={{ fontSize: '22px', fontWeight: '800', letterSpacing: '-0.5px' }}>
          {contract ? `Sözleşme Düzenle: #${contract.contractNumber}` : 'Yeni Satış Sözleşmesi'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1100px', margin: '0 auto' }}>
            <div className="card">
              <div className="form-section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <User size={18} />
                  Müşteri Bilgileri
                </div>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ padding: '6px 12px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', height: '32px' }}
                  onClick={() => setShowAdditionalDetails(!showAdditionalDetails)}
                >
                  {showAdditionalDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  {showAdditionalDetails ? 'Detayları Gizle' : 'Fatura & Vergi Detayları'}
                </button>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Müşteri Adı Soyadı *</label>
                  <input 
                    type="text" 
                    required 
                    className="form-input" 
                    placeholder="Adı Soyadı"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Telefon Numarası</label>
                  <input 
                    type="tel" 
                    className="form-input" 
                    placeholder="05__ ___ __ __"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Sözleşme Tarihi</label>
                  <input 
                    type="date" 
                    className="form-input" 
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Sözleşme Numarası</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Sözleşme No"
                    value={contractNumber}
                    onChange={(e) => setContractNumber(e.target.value)}
                  />
                </div>

                {showAdditionalDetails && (
                  <>
                    <div className="form-group">
                      <label>E-posta Adresi</label>
                      <input 
                        type="email" 
                        className="form-input" 
                        placeholder="E-posta adresi"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label>T.C. Kimlik No</label>
                      <input 
                        type="text" 
                        maxLength={11}
                        className="form-input" 
                        placeholder="T.C. Kimlik No"
                        value={tcNo}
                        onChange={(e) => setTcNo(e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label>Vergi Dairesi</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        placeholder="Vergi Dairesi"
                        value={taxOffice}
                        onChange={(e) => setTaxOffice(e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label>Vergi Numarası</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        placeholder="Vergi Numarası"
                        value={taxNo}
                        onChange={(e) => setTaxNo(e.target.value)}
                      />
                    </div>
                  </>
                )}
              </div>

              {showAdditionalDetails && (
                <div className="form-group full-width" style={{ marginBottom: '20px' }}>
                  <label>Fatura Adresi</label>
                  <textarea 
                    className="form-textarea" 
                    rows={2} 
                    placeholder="Fatura kesilecek yasal adres..."
                    value={billingAddress}
                    onChange={(e) => setBillingAddress(e.target.value)}
                  />
                </div>
              )}

              <div className="form-group full-width">
                <label>Uygulama Adresi (Parke Döşenecek Adres)</label>
                <textarea 
                  className="form-textarea" 
                  rows={2} 
                  placeholder="Malzemenin kurulacağı / teslim edileceği yer..."
                  value={installationAddress}
                  onChange={(e) => setInstallationAddress(e.target.value)}
                />
              </div>
            </div>
            <div className="card">
              <div className="form-section-title">
                <FileSpreadsheet size={18} />
                Malzemeler ve Hizmetler
              </div>

              <div className="items-table-wrapper">
                <table className="items-table">
                  <thead>
                    <tr>
                      <th style={{ width: '32%' }}>Malzeme Tanımı</th>
                      <th style={{ width: '10%' }}>Miktar</th>
                      <th style={{ width: '8%' }}>Birim</th>
                      <th style={{ width: '10%' }}>KDV Oranı</th>
                      <th style={{ width: '14%' }}>Birim Fiyat (Hariç)</th>
                      <th style={{ width: '14%' }}>Birim Fiyat (Dahil)</th>
                      <th style={{ width: '12%', textAlign: 'right' }}>Tutar (Dahil)</th>
                      <th style={{ width: '40px' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => (
                      <tr key={item.id}>
                        <td>
                          <input
                            type="text"
                            list="catalog-suggestions"
                            className="form-input"
                            placeholder="Malzeme adını yazın veya seçin..."
                            value={item.name}
                            onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                            style={{ fontSize: '16px', padding: '12px 14px', height: '46px', fontWeight: '600' }}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            step="any"
                            className="form-input"
                            placeholder="0"
                            value={item.qty || ''}
                            onChange={(e) => handleItemChange(index, 'qty', Number(e.target.value))}
                            style={{ fontSize: '16px', padding: '12px 14px', height: '46px', fontWeight: '600' }}
                          />
                        </td>
                        <td>
                          <select
                            className="form-select"
                            value={item.unit || 'm²'}
                            onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                            style={{ fontSize: '16px', padding: '10px 12px', height: '46px', fontWeight: '600' }}
                          >
                            <option value="m²">m²</option>
                            <option value="Adet">Adet</option>
                            <option value="Metre">Metre</option>
                            <option value="Paket">Paket</option>
                          </select>
                        </td>
                        <td>
                          <select
                            className="form-select"
                            value={item.kdv || 0}
                            onChange={(e) => handleItemChange(index, 'kdv', e.target.value)}
                            style={{ fontSize: '16px', padding: '10px 12px', height: '46px', fontWeight: '600' }}
                          >
                            <option value="0">Hariç (0%)</option>
                            <option value="10">%10 KDV</option>
                            <option value="20">%20 KDV</option>
                          </select>
                        </td>
                        <td>
                          <input
                            type="number"
                            step="any"
                            className="form-input"
                            placeholder="0"
                            value={item.priceExcl || ''}
                            onChange={(e) => handleItemChange(index, 'priceExcl', Number(e.target.value))}
                            style={{ fontSize: '16px', padding: '12px 14px', height: '46px', fontWeight: '600' }}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            step="any"
                            className="form-input"
                            placeholder="0"
                            value={item.priceIncl || ''}
                            onChange={(e) => handleItemChange(index, 'priceIncl', Number(e.target.value))}
                            style={{ fontSize: '16px', padding: '12px 14px', height: '46px', fontWeight: '600' }}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            step="any"
                            className="form-input"
                            placeholder="0"
                            value={item.total || ''}
                            onChange={(e) => handleItemChange(index, 'total', Number(e.target.value))}
                            style={{ fontSize: '16px', padding: '12px 14px', height: '46px', fontWeight: '700', textAlign: 'right' }}
                          />
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            {item.name.trim() && !catalog.some(cat => cat.name.toLowerCase() === item.name.trim().toLowerCase()) && (
                              <button 
                                type="button" 
                                className="table-action-btn"
                                style={{ padding: '8px', color: 'var(--primary)' }}
                                title="Bu ürünü kataloğa kaydet"
                                onClick={() => handleQuickSaveToCatalog(index)}
                              >
                                <Plus size={18} />
                              </button>
                            )}
                            <button 
                              type="button" 
                              className="table-action-btn"
                              style={{ padding: '8px' }}
                              onClick={() => removeItemRow(index)}
                            >
                              <Trash size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {/* Datalists declared only once outside of map to prevent standard duplication bugs */}
                <datalist id="catalog-suggestions">
                  {catalog.map(cat => (
                    <option key={cat.id} value={cat.name} />
                  ))}
                </datalist>
              </div>

              <button 
                type="button" 
                className="btn btn-secondary" 
                style={{ width: '100%', marginBottom: '20px' }}
                onClick={addItemRow}
              >
                <Plus size={16} /> Satır Ekle
              </button>

              {/* İskonto Bölümü */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', borderTop: '1px solid var(--border)', paddingTop: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
                <span style={{ fontWeight: '700', fontSize: '14px', color: 'var(--text-main)' }}>İskonto Uygula:</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <select
                    className="form-select"
                    value={discountType}
                    onChange={(e) => {
                      setDiscountType(e.target.value);
                      setDiscountValue(0);
                    }}
                    style={{ width: '120px', height: '38px', padding: '6px 10px', fontSize: '14px', fontWeight: '600' }}
                  >
                    <option value="percentage">Oran (%)</option>
                    <option value="amount">Tutar (TL)</option>
                  </select>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    className="form-input"
                    placeholder="0"
                    value={discountValue || ''}
                    onChange={(e) => setDiscountValue(Number(e.target.value) || 0)}
                    style={{ width: '120px', height: '38px', padding: '6px 10px', fontSize: '14px', fontWeight: '600' }}
                  />
                </div>
                {discountAmount > 0 && (
                  <span style={{ fontSize: '14px', color: 'var(--danger)', fontWeight: '700' }}>
                    İndirim Tutarı: -{formatCurrency(discountAmount)}
                  </span>
                )}
              </div>

              {/* Totals Summary */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid var(--border)', paddingTop: '16px', fontSize: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Ara Toplam (KDV Hariç):</span>
                  <span style={{ fontWeight: '600' }}>{formatCurrency(subtotalExcl)}</span>
                </div>
                {kdv10Total > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                    <span>Hesaplanan KDV (%10):</span>
                    <span>{formatCurrency(kdv10Total)}</span>
                  </div>
                )}
                {kdv20Total > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                    <span>Hesaplanan KDV (%20):</span>
                    <span>{formatCurrency(kdv20Total)}</span>
                  </div>
                )}
                {totalKdv > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed var(--border)', paddingTop: '4px', fontWeight: '600' }}>
                    <span>Toplam KDV:</span>
                    <span>{formatCurrency(totalKdv)}</span>
                  </div>
                )}
                {discountAmount > 0 && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed var(--border)', paddingTop: '4px', color: 'var(--text-muted)' }}>
                      <span>Ara Toplam (KDV Dahil):</span>
                      <span>{formatCurrency(subtotalIncl)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--danger)', fontWeight: '600' }}>
                      <span>Uygulanan İskonto ({discountType === 'percentage' ? `%${discountValue}` : 'Tutar'}):</span>
                      <span>-{formatCurrency(discountAmount)}</span>
                    </div>
                  </>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: '700', borderTop: '1px solid var(--border)', paddingTop: '8px', color: 'var(--primary)' }}>
                  <span>Genel Toplam (KDV Dahil):</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="form-section-title">
                <FileText size={18} />
                Sözleşme Açıklaması / Notlar
              </div>
              <div className="form-group">
                <textarea 
                  className="form-textarea" 
                  rows={4} 
                  placeholder="Sözleşmeye eklemek istediğiniz özel notlar, montaj detayları veya açıklamaları buraya yazın..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{ fontSize: '16px', fontWeight: '500' }}
                />
              </div>
            </div>

            <div className="card">
              <div className="form-section-title">
                <FileText size={18} />
                Ödeme ve Teslimat
              </div>

              <div className="form-grid">
                {/* Dynamic Payments Section */}
                <div className="form-group full-width" style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                  <label style={{ fontWeight: '700' }}>Ödeme Tahsilat Detayları</label>
                  <div className="items-table-wrapper" style={{ border: '1px solid var(--border)', borderRadius: '6px', overflow: 'hidden' }}>
                    <table className="items-table" style={{ margin: 0, width: '100%' }}>
                      <thead>
                        <tr>
                          <th style={{ width: '20%' }}>Tarih</th>
                          <th style={{ width: '25%' }}>Ödeme Kanalı</th>
                          <th style={{ width: '20%' }}>Tutar (TL)</th>
                          <th style={{ width: '30%' }}>Açıklama</th>
                          <th style={{ width: '40px' }}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {payments.map((p, index) => (
                          <tr key={p.id || index}>
                            <td>
                              <input
                                type="date"
                                className="form-input"
                                value={p.date || ''}
                                onChange={(e) => handlePaymentChange(index, 'date', e.target.value)}
                                style={{ height: '38px', padding: '6px 10px', fontSize: '14px' }}
                              />
                            </td>
                            <td>
                              <select
                                className="form-select"
                                value={p.method || 'Nakit'}
                                onChange={(e) => handlePaymentChange(index, 'method', e.target.value)}
                                style={{ height: '38px', padding: '6px 10px', fontSize: '14px', fontWeight: '600' }}
                              >
                                <option value="Nakit">Elden (Nakit)</option>
                                <option value="Akbank Havale">Akbank Havale/EFT</option>
                                <option value="VakıfBank Havale">VakıfBank Havale/EFT</option>
                                <option value="Kredi Kartı">Kredi Kartı</option>
                                <option value="Diğer Banka">Diğer Banka Havale/EFT</option>
                              </select>
                            </td>
                            <td>
                              <input
                                type="number"
                                className="form-input"
                                placeholder="0"
                                value={p.amount || ''}
                                onChange={(e) => handlePaymentChange(index, 'amount', Number(e.target.value))}
                                style={{ height: '38px', padding: '6px 10px', fontSize: '14px', fontWeight: '700' }}
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                className="form-input"
                                placeholder="Açıklama (Örn: İş başı peşinatı)..."
                                value={p.description || ''}
                                onChange={(e) => handlePaymentChange(index, 'description', e.target.value)}
                                style={{ height: '38px', padding: '6px 10px', fontSize: '14px' }}
                              />
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <button
                                type="button"
                                className="table-action-btn"
                                style={{ padding: '6px' }}
                                onClick={() => removePaymentRow(index)}
                              >
                                <Trash size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                        {payments.length === 0 && (
                          <tr>
                            <td colSpan="5" style={{ textAlign: 'center', padding: '16px', color: 'var(--text-muted)' }}>
                              Kayıtlı ödeme bulunmuyor. Eklemek için aşağıdaki butona tıklayın.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={addPaymentRow}
                    style={{ alignSelf: 'flex-start', padding: '6px 12px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}
                  >
                    <Plus size={14} /> Yeni Ödeme Satırı Ekle
                  </button>
                </div>

                <div className="form-group">
                  <label>Kalan Bakiye</label>
                  <div className="form-input" style={{ backgroundColor: 'var(--primary-light)', fontWeight: '700', color: remaining > 0 ? 'var(--danger)' : 'var(--success)' }}>
                    {formatCurrency(remaining)}
                  </div>
                </div>

                <div className="form-group">
                  <label>Planlanan Teslim Tarihi</label>
                  <input 
                    type="date" 
                    className="form-input" 
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                  />
                </div>

                <div className="form-group full-width">
                  <label>Sözleşme Sipariş Durumu</label>
                  <select 
                    className="form-select"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="hazirlaniyor">Hazırlanıyor</option>
                    <option value="odeme_bekliyor">Ödeme Bekliyor</option>
                    <option value="teslimat_bekliyor">Teslimat Bekliyor</option>
                    <option value="tamamlandi">Tamamlandı</option>
                  </select>
                </div>
              </div>

              {/* Canvas Signatures */}
              <div className="signature-section">
                <SignaturePad 
                  title="Müşteri İmzası"
                  savedImage={customerSignature}
                  onSave={setCustomerSignature}
                />
                
                <SignaturePad 
                  title="Satış Yetkilisi İmzası"
                  savedImage={salesRepSignature}
                  onSave={setSalesRepSignature}
                />
              </div>
            </div>

            {/* Submit Action */}
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end', marginTop: '24px' }}>
              <button type="button" className="btn btn-secondary" onClick={onBack}>
                Vazgeç
              </button>
              <button type="submit" className="btn btn-primary">
                <Save size={18} />
                Sözleşmeyi Kaydet
              </button>
            </div>
      </form>
    </div>
  );
}
