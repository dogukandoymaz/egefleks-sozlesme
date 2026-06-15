import { useState } from 'react';
import { Storage } from '../utils/storage';
import { 
  Building, 
  FileText, 
  Save, 
  Plus, 
  Trash2, 
  ArrowLeft, 
  CheckCircle2
} from 'lucide-react';

export default function Settings({ onBack }) {
  const [settings, setSettings] = useState(Storage.getSettings());
  const [successMsg, setSuccessMsg] = useState('');

  const triggerSuccessAlert = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleSaveStoreDetails = (e) => {
    if (e) e.preventDefault();
    Storage.saveSettings(settings);
    triggerSuccessAlert('Ayarlar başarıyla kaydedildi!');
  };

  const handleTermChange = (index, value) => {
    const updatedTerms = [...settings.terms];
    updatedTerms[index] = value;
    setSettings({ ...settings, terms: updatedTerms });
  };

  const handleAddTerm = () => {
    setSettings({
      ...settings,
      terms: [...settings.terms, 'Yeni sözleşme maddesi içeriği...']
    });
  };

  const handleRemoveTerm = (index) => {
    const updatedTerms = settings.terms.filter((_, idx) => idx !== index);
    setSettings({ ...settings, terms: updatedTerms });
  };

  return (
    <div>
      {/* Top Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button className="btn btn-secondary btn-icon-only" onClick={onBack}>
            <ArrowLeft size={18} />
          </button>
          <h2 style={{ fontSize: '22px', fontWeight: '800', letterSpacing: '-0.5px' }}>Sistem Ayarları</h2>
        </div>

        {successMsg && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', padding: '8px 16px', borderRadius: 'var(--radius-sm)', fontWeight: '600', fontSize: '14px' }}>
            <CheckCircle2 size={16} />
            {successMsg}
          </div>
        )}
      </div>

      <div className="settings-grid">
        
        {/* LEFT COLUMN: STORE INFO */}
        <div className="card">
          <div className="form-section-title">
            <Building size={18} />
            Mağaza & Şirket Bilgileri
          </div>

          <form onSubmit={handleSaveStoreDetails}>
            <div className="form-grid">
              <div className="form-group full-width">
                <label>Mağaza Adı (Marka)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={settings.storeName}
                  onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                />
              </div>

              <div className="form-group full-width">
                <label>Resmi Şirket Unvanı</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={settings.companyTitle}
                  onChange={(e) => setSettings({ ...settings, companyTitle: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Telefon Numaraları</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={settings.phone}
                  onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>E-posta</label>
                <input 
                  type="email" 
                  className="form-input" 
                  value={settings.email}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Web Sitesi</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={settings.website}
                  onChange={(e) => setSettings({ ...settings, website: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Banka Hesap / IBAN Bilgileri</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={settings.bankInfo}
                  onChange={(e) => setSettings({ ...settings, bankInfo: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Vergi Dairesi</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={settings.taxOffice}
                  onChange={(e) => setSettings({ ...settings, taxOffice: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Vergi Numarası</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={settings.taxNo}
                  onChange={(e) => setSettings({ ...settings, taxNo: e.target.value })}
                />
              </div>

              <div className="form-group full-width">
                <label>Mağaza Adresi</label>
                <textarea 
                  className="form-textarea" 
                  rows={2} 
                  value={settings.address}
                  onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '16px' }}>
              <Save size={16} /> Mağaza Bilgilerini Kaydet
            </button>
          </form>
        </div>

        {/* RIGHT COLUMN: LEGAL TERMS */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="form-section-title">
            <FileText size={18} />
            Sözleşme Yasal Maddeleri
          </div>
          
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Buradaki maddeler A4 yazdırılabilir sözleşmenin altında otomatik olarak listelenir.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px', maxHeight: '430px', overflowY: 'auto', paddingRight: '4px' }}>
            {settings.terms?.map((term, index) => (
              <div key={index} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <span style={{ fontWeight: '700', fontSize: '13px', marginTop: '10px', width: '24px' }}>
                  {index + 1}.
                </span>
                <textarea 
                  className="form-textarea" 
                  rows={2} 
                  value={term}
                  onChange={(e) => handleTermChange(index, e.target.value)}
                  style={{ fontSize: '13px' }}
                />
                <button 
                  type="button" 
                  className="table-action-btn" 
                  style={{ marginTop: '8px' }}
                  onClick={() => handleRemoveTerm(index)}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: 'auto' }}>
            <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={handleAddTerm}>
              <Plus size={16} /> Yeni Madde Ekle
            </button>
            <button 
              type="button" 
              className="btn btn-primary" 
              style={{ flex: 1 }} 
              onClick={handleSaveStoreDetails}
            >
              <Save size={16} /> Maddeleri Kaydet
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
