import { useEffect } from 'react';
import { Storage } from '../utils/storage';
import { ArrowLeft, Printer } from 'lucide-react';

export default function ContractPrint({ contractId, onBack }) {
  const contract = Storage.getContractById(contractId);
  const settings = Storage.getSettings();

  useEffect(() => {
    // Scroll to top when view opens
    window.scrollTo(0, 0);
  }, []);

  if (!contract) {
    return (
      <div style={{ padding: '32px', textAlign: 'center' }}>
        <p>Sözleşme bulunamadı.</p>
        <button className="btn btn-secondary" onClick={onBack}>Geri Dön</button>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(val || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  const hasKdv = contract.items?.some(item => Number(item.kdv || 0) > 0);

  return (
    <div>
      {/* Action buttons (hidden on print) */}
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button className="btn btn-secondary btn-icon-only" onClick={onBack}>
            <ArrowLeft size={18} />
          </button>
          <h2 style={{ fontSize: '20px', fontWeight: '800' }}>Sözleşme Önizleme & Yazdırma</h2>
        </div>
        <button className="btn btn-primary" onClick={handlePrint}>
          <Printer size={18} />
          Yazdır / PDF Kaydet
        </button>
      </div>

      {/* Printable Sheet (styled to look like A4 paper on screen, regular paper on print) */}
      <div className="card" style={{ maxWidth: '850px', margin: '0 auto', padding: '40px', backgroundColor: '#ffffff', color: '#000000', border: '1px solid #d1d5db', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
        
        {/* Header section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #000000', paddingBottom: '16px', marginBottom: '20px' }}>
          <div>
            <div style={{ fontSize: '32px', fontWeight: '900', color: '#000000', letterSpacing: '-1.5px', textTransform: 'lowercase', display: 'flex', alignItems: 'baseline', gap: '2px' }}>
              egefleks
            </div>
            <div style={{ fontSize: '8px', fontWeight: '700', letterSpacing: '0.5px', color: '#4b5563', textTransform: 'uppercase', lineHeight: '1.3' }}>
              {settings.companyTitle?.includes('SANAYİ TİCARET LİMİTED ŞİRKETİ') ? (
                <>
                  {settings.companyTitle.replace('SANAYİ TİCARET LİMİTED ŞİRKETİ', '').trim()}
                  <br />
                  SANAYİ TİCARET LİMİTED ŞİRKETİ
                </>
              ) : settings.companyTitle}
            </div>
          </div>
          
          <div style={{ textAlign: 'right', fontSize: '9px', lineHeight: '1.4', color: '#1f2937' }}>
            <div>{settings.address}</div>
            <div>Tel: {settings.phone}</div>
            <div>E-mail: {settings.email} | Web: {settings.website}</div>
            <div style={{ fontWeight: '600', marginTop: '2px' }}>V.D: {settings.taxOffice} - No: {settings.taxNo}</div>
          </div>
        </div>

        {/* Info Grid: Contract details, Date, Customer Details */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '20px', marginBottom: '20px', fontSize: '11px' }}>
          {/* Customer Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', paddingBottom: '4px' }}>
              <span style={{ fontWeight: '700', width: '110px' }}>Adı Soyadı:</span>
              <span>{contract.customerName}</span>
            </div>
            <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', paddingBottom: '4px' }}>
              <span style={{ fontWeight: '700', width: '110px' }}>Telefon:</span>
              <span>{contract.phone || '-'}</span>
            </div>
            <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', paddingBottom: '4px' }}>
              <span style={{ fontWeight: '700', width: '110px' }}>E-mail:</span>
              <span>{contract.email || '-'}</span>
            </div>
            <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', paddingBottom: '4px' }}>
              <span style={{ fontWeight: '700', width: '110px' }}>T.C. No / Vergi No:</span>
              <span>{contract.tcNo || contract.taxNo || '-'}</span>
            </div>
            <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', paddingBottom: '4px' }}>
              <span style={{ fontWeight: '700', width: '110px' }}>Fatura Adresi:</span>
              <span style={{ flex: 1 }}>{contract.billingAddress || '-'}</span>
            </div>
            <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', paddingBottom: '4px' }}>
              <span style={{ fontWeight: '700', width: '110px' }}>Uygulama Adresi:</span>
              <span style={{ flex: 1 }}>{contract.installationAddress || '-'}</span>
            </div>
          </div>

          {/* Contract Metadata */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', borderLeft: '1px solid #e5e7eb', paddingLeft: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e5e7eb', paddingBottom: '4px' }}>
              <span style={{ fontWeight: '700' }}>Sözleşme No:</span>
              <span style={{ fontWeight: '700', fontSize: '13px' }}>#{contract.contractNumber}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e5e7eb', paddingBottom: '4px' }}>
              <span style={{ fontWeight: '700' }}>Tarih:</span>
              <span>{formatDate(contract.date)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e5e7eb', paddingBottom: '4px' }}>
              <span style={{ fontWeight: '700' }}>Teslim Tarihi:</span>
              <span>{formatDate(contract.deliveryDate)}</span>
            </div>
            {settings.bankInfo && (
              <div style={{ marginTop: '12px', paddingTop: '6px', borderTop: '1px dashed #cbd5e1', fontSize: '8px', lineHeight: '1.35', textAlign: 'left', whiteSpace: 'pre-line' }}>
                <span style={{ fontWeight: '700', color: '#000000', display: 'block', marginBottom: '2px', fontSize: '8.5px' }}>BANKA HESAP BİLGİLERİ:</span>
                {settings.bankInfo}
              </div>
            )}
          </div>
        </div>

        {/* Materials Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', fontSize: '11px' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #000000', borderTop: '2px solid #000000' }}>
              <th style={{ textAlign: 'left', padding: '8px', fontWeight: '700' }}>Malzeme / Uygulama Adı</th>
              <th style={{ textAlign: 'center', padding: '8px', fontWeight: '700', width: '60px' }}>Birim</th>
              <th style={{ textAlign: 'center', padding: '8px', fontWeight: '700', width: '70px' }}>Miktar</th>
              {hasKdv && <th style={{ textAlign: 'center', padding: '8px', fontWeight: '700', width: '60px' }}>KDV</th>}
              <th style={{ textAlign: 'right', padding: '8px', fontWeight: '700', width: '100px' }}>{hasKdv ? 'Birim Fiyat (Hariç)' : 'Birim Fiyat'}</th>
              <th style={{ textAlign: 'right', padding: '8px', fontWeight: '700', width: '110px' }}>{hasKdv ? 'Tutar (Dahil)' : 'Tutar'}</th>
            </tr>
          </thead>
          <tbody>
            {contract.items?.map((item, index) => {
              const kdvText = item.kdv && item.kdv > 0 ? `%${item.kdv}` : 'Hariç';
              const priceExclVal = item.priceExcl !== undefined ? item.priceExcl : (item.price || 0);
              const priceVal = hasKdv ? priceExclVal : (item.priceIncl || item.price || 0);
              return (
                <tr key={index} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '8px' }}>{item.name}</td>
                  <td style={{ padding: '8px', textAlign: 'center' }}>{item.unit}</td>
                  <td style={{ padding: '8px', textAlign: 'center' }}>{item.qty}</td>
                  {hasKdv && <td style={{ padding: '8px', textAlign: 'center' }}>{kdvText}</td>}
                  <td style={{ padding: '8px', textAlign: 'right' }}>{formatCurrency(priceVal)}</td>
                  <td style={{ padding: '8px', textAlign: 'right', fontWeight: '600' }}>{formatCurrency(item.total)}</td>
                </tr>
              );
            })}
            {/* Summary calculations */}
            <tr style={{ borderTop: '2px solid #000000' }}>
              <td colSpan={hasKdv ? 4 : 3} style={{ border: 'none' }}></td>
              <td style={{ padding: '6px 8px', fontWeight: '700', textAlign: 'right' }}>{hasKdv ? 'Ara Toplam (KDV Hariç):' : 'Ara Toplam:'}</td>
              <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: '600' }}>{formatCurrency(contract.subtotalExcl !== undefined && hasKdv ? contract.subtotalExcl : contract.subtotal)}</td>
            </tr>
            {hasKdv && contract.totalKdv !== undefined && contract.totalKdv > 0 && (
              <tr>
                <td colSpan={4} style={{ border: 'none' }}></td>
                <td style={{ padding: '4px 8px', fontWeight: '700', textAlign: 'right', color: '#4b5563' }}>Hesaplanan KDV:</td>
                <td style={{ padding: '4px 8px', textAlign: 'right', color: '#4b5563' }}>{formatCurrency(contract.totalKdv)}</td>
              </tr>
            )}
            {contract.discountAmount !== undefined && contract.discountAmount > 0 && (
              <tr>
                <td colSpan={hasKdv ? 4 : 3} style={{ border: 'none' }}></td>
                <td style={{ padding: '4px 8px', fontWeight: '700', textAlign: 'right', color: '#4b5563' }}>
                  İskonto ({contract.discountType === 'percentage' ? `%${contract.discountValue}` : 'Tutar'}):
                </td>
                <td style={{ padding: '4px 8px', textAlign: 'right', color: '#ef4444', fontWeight: '600' }}>
                  -{formatCurrency(contract.discountAmount)}
                </td>
              </tr>
            )}
            <tr>
              <td colSpan={hasKdv ? 4 : 3} style={{ border: 'none' }}></td>
              <td style={{ padding: '6px 8px', fontWeight: '700', textAlign: 'right', borderBottom: '2px solid #000000' }}>{hasKdv ? 'Genel Toplam (KDV Dahil):' : 'Genel Toplam:'}</td>
              <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: '700', fontSize: '12px', borderBottom: '2px solid #000000' }}>{formatCurrency(contract.total)}</td>
            </tr>
            {/* Payments detail */}
            <tr>
              <td colSpan={hasKdv ? 4 : 3} style={{ border: 'none' }}></td>
              <td style={{ padding: '4px 8px', textAlign: 'right', color: '#4b5563' }}>Nakit Ödeme:</td>
              <td style={{ padding: '4px 8px', textAlign: 'right', color: '#4b5563' }}>{formatCurrency(contract.cashPayment)}</td>
            </tr>
            {contract.cardPayment > 0 && (
              <tr>
                <td colSpan={hasKdv ? 4 : 3} style={{ border: 'none' }}></td>
                <td style={{ padding: '4px 8px', textAlign: 'right', color: '#4b5563' }}>Kart / Vade:</td>
                <td style={{ padding: '4px 8px', textAlign: 'right', color: '#4b5563' }}>{formatCurrency(contract.cardPayment)}</td>
              </tr>
            )}
            <tr style={{ fontWeight: '700' }}>
              <td colSpan={hasKdv ? 4 : 3} style={{ border: 'none' }}></td>
              <td style={{ padding: '6px 8px', textAlign: 'right', color: contract.remaining > 0 ? '#ef4444' : '#10b981' }}>Kalan Bakiye:</td>
              <td style={{ padding: '6px 8px', textAlign: 'right', color: contract.remaining > 0 ? '#ef4444' : '#10b981', fontSize: '12px' }}>
                {contract.remaining > 0 ? formatCurrency(contract.remaining) : 'Ödendi / Bakiye Yok'}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Sözleşme Açıklaması / Özel Notlar (Visible on print & preview) */}
        {contract.description && (
          <div style={{ fontSize: '9px', color: '#000000', border: '1px solid #e5e7eb', borderRadius: '4px', padding: '10px', marginBottom: '20px', backgroundColor: '#ffffff' }}>
            <div style={{ fontWeight: '700', borderBottom: '1px solid #e5e7eb', paddingBottom: '4px', marginBottom: '6px', fontSize: '10px' }}>SÖZLEŞME AÇIKLAMASI / ÖZEL NOTLAR</div>
            <div style={{ whiteSpace: 'pre-line', lineHeight: '1.4' }}>{contract.description}</div>
          </div>
        )}

        {/* Terms & Conditions Section (The 11 clauses) */}
        <div style={{ fontSize: '8px', color: '#374151', borderTop: '1px solid #000000', paddingTop: '10px', lineHeight: '1.35', textAlign: 'justify' }}>
          <div style={{ fontWeight: '700', fontSize: '9px', marginBottom: '6px', color: '#000000' }}>SÖZLEŞME HÜKÜMLERİ</div>
          <ol style={{ paddingLeft: '12px', listStyleType: 'decimal' }}>
            {settings.terms?.map((term, index) => (
              <li key={index} style={{ marginBottom: '3px' }}>{term}</li>
            ))}
          </ol>
        </div>

        {/* Signatures Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px' }}>
          {/* Customer Signature */}
          <div style={{ width: '45%', border: '1px solid #000000', padding: '8px', height: '110px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ fontWeight: '700', fontSize: '10px', borderBottom: '1px solid #000000', paddingBottom: '4px', textAlign: 'center' }}>
              MÜŞTERİ İMZASI
            </div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              {contract.customerSignature && (
                <img src={contract.customerSignature} alt="Müşteri İmzası" style={{ maxHeight: '70px', maxWidth: '100%', objectFit: 'contain' }} />
              )}
            </div>
            <div style={{ fontSize: '9px', textAlign: 'center', fontWeight: '600' }}>{contract.customerName}</div>
          </div>

          {/* Sales Representative Signature */}
          <div style={{ width: '45%', border: '1px solid #000000', padding: '8px', height: '110px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ fontWeight: '700', fontSize: '10px', borderBottom: '1px solid #000000', paddingBottom: '4px', textAlign: 'center' }}>
              SATIŞ YETKİLİSİ İMZASI
            </div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              {contract.salesRepSignature && (
                <img src={contract.salesRepSignature} alt="Satış Yetkilisi İmzası" style={{ maxHeight: '70px', maxWidth: '100%', objectFit: 'contain' }} />
              )}
            </div>
            <div style={{ fontSize: '9px', textAlign: 'center', fontWeight: '600' }}>{settings.storeName}</div>
          </div>
        </div>

      </div>
    </div>
  );
}
