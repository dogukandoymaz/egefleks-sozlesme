import { useState } from 'react';
import { Storage } from '../utils/storage';
import { 
  Building, 
  FileText, 
  Save, 
  Plus, 
  Trash2, 
  ArrowLeft, 
  CheckCircle2,
  Database,
  Download,
  Upload
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

  const handleDownloadBackup = () => {
    try {
      const data = Storage.getFullBackup();
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(data, null, 2)
      )}`;
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', jsonString);
      
      const dateStr = new Date().toISOString().split('T')[0];
      downloadAnchor.setAttribute('download', `egefleks_sozlesme_yedek_${dateStr}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      triggerSuccessAlert('Veritabanı yedeği başarıyla indirildi!');
    } catch (err) {
      console.error('Yedek alma hatası:', err);
      alert('Yedek alınırken bir hata oluştu.');
    }
  };

  const handleRestoreBackup = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!window.confirm('Dikkat! Bu yedeği yüklemek mevcut tüm sözleşmelerinizi ve ayarlarınızı silip yerine yedekteki verileri yazacaktır. Devam etmek istiyor musunuz?')) {
      e.target.value = ''; // Reset input
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const backupData = JSON.parse(event.target.result);
        
        // Basic validation
        if (!backupData.settings || !backupData.catalog || !backupData.contracts) {
          alert('Geçersiz yedek dosyası! Lütfen doğru formatta bir Egefleks yedek dosyası seçin.');
          e.target.value = '';
          return;
        }

        const success = await Storage.restoreBackup(backupData);
        if (success) {
          triggerSuccessAlert('Veritabanı başarıyla geri yüklendi! Sayfa yenileniyor...');
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        } else {
          alert('Yedek geri yüklenirken veritabanı hatası oluştu.');
        }
      } catch (err) {
        console.error('Yedek yükleme hatası:', err);
        alert('Yedek dosyası okunurken hata oluştu. Dosyanın geçerli bir JSON olduğundan emin olun.');
      }
      e.target.value = ''; // Reset input
    };
    reader.readAsText(file);
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

        {/* FULL WIDTH COLUMN: BACKUP & RESTORE */}
        <div className="card" style={{ gridColumn: '1 / -1', marginTop: '24px' }}>
          <div className="form-section-title">
            <Database size={18} />
            Veritabanı Yedekleme & Kurtarma (Yedek Al/Yükle)
          </div>
          
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Tüm sözleşmelerinizi, ürünlerinizi ve sistem ayarlarınızı tek bir dosya halinde bilgisayarınıza indirebilir, 
            dilediğiniz zaman bu dosyayı yükleyerek sisteminizi eski bir tarihe geri döndürebilirsiniz.
          </p>

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={handleDownloadBackup}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Download size={16} /> Veritabanı Yedeğini Bilgisayara İndir (.json)
            </button>

            <div style={{ position: 'relative' }}>
              <input 
                type="file" 
                id="backup-upload" 
                accept=".json" 
                onChange={handleRestoreBackup}
                style={{ display: 'none' }} 
              />
              <label 
                htmlFor="backup-upload" 
                className="btn btn-secondary" 
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
              >
                <Upload size={16} /> Bilgisayardan Yedek Yükle (.json)
              </label>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
