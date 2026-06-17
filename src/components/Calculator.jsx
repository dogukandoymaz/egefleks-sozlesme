import { useState } from 'react';
import { Search, ChevronRight } from 'lucide-react';
import { Storage } from '../utils/storage';

export default function Calculator({ onPrefillContract }) {
  // Parquet catalog database loaded dynamically
  const parquetProducts = Storage.getParquetCatalog();

  // Global params
  const [jobM2, setJobM2] = useState(20);
  const [laborPrice, setLaborPrice] = useState(150);
  const [removalPrice, setRemovalPrice] = useState(0);
  const [removalType, setRemovalType] = useState('fixed'); // 'm2' | 'fixed'
  const [elevatorPrice, setElevatorPrice] = useState(0);
  const [elevatorType, setElevatorType] = useState('fixed'); // 'm2' | 'fixed'
  const [furnishedPrice, setFurnishedPrice] = useState(0);
  const [furnishedType, setFurnishedType] = useState('fixed'); // 'm2' | 'fixed'
  const [roadPrice, setRoadPrice] = useState(0); // always 'fixed'
  
  // Skirting params
  const [skirtingType, setSkirtingType] = useState('yes'); // 'none' | 'yes'
  const [skirtingUnitPrice, setSkirtingUnitPrice] = useState(30); // Serbest Fiyat (metre fiyatı)
  const [skirtingMeters, setSkirtingMeters] = useState('');
  const [prevJobM2, setPrevJobM2] = useState(20);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [brandFilter, setBrandFilter] = useState('hepsi');

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(val);
  };

  const brands = ['hepsi', ...new Set(parquetProducts.map(p => p.brand))];

  // Calculate skirting meters (1.1 ratio rounded up to nearest 2.8m profile)
  // Rounded to 1 decimal place to prevent floating-point precision issues
  const defaultSkirtingMeters = jobM2 > 0 
    ? Number((Math.ceil((Number(jobM2) * 1.1) / 2.8) * 2.8).toFixed(1))
    : 0;

  // Auto-reset custom value when job area changes to keep recommendation in sync
  if (jobM2 !== prevJobM2) {
    setPrevJobM2(jobM2);
    setSkirtingMeters('');
  }

  const calculatedSkirtingMeters = skirtingMeters !== '' 
    ? Number(skirtingMeters) 
    : defaultSkirtingMeters;

  const totalSkirtingPrice = skirtingType !== 'none' ? (skirtingUnitPrice * calculatedSkirtingMeters) : 0;

  // Filter products
  const filteredProducts = parquetProducts.filter(p => {
    const matchesSearch = 
      p.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.series.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.class.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBrand = brandFilter === 'hepsi' || p.brand === brandFilter;
    return matchesSearch && matchesBrand;
  });

  const handleTransfer = (product, calc, transferType = 'detailed') => {
    const items = [];
    const packagesCount = product.packageM2 > 0 ? Math.ceil(Number(jobM2) / product.packageM2) : 0;
    const soldM2 = Number((packagesCount * product.packageM2).toFixed(4));
    
    if (transferType === 'package') {
      const packageUnitPrice = soldM2 > 0 ? (calc.grandTotal / soldM2) : 0;
      items.push({
        id: 'parquet_package',
        name: `${product.brand} ${product.series} ${product.mm}mm ${product.class} ${product.beveled} (${packagesCount} Paket)`.trim(),
        unit: 'm²',
        qty: soldM2,
        priceExcl: packageUnitPrice,
        priceIncl: packageUnitPrice,
        total: calc.grandTotal,
        totalExcl: calc.grandTotal,
        kdv: 0,
        kdvAmount: 0
      });
    } else {
      // 1. Parquet Row
      const m2Price = product.packagePrice > 0 ? (product.packagePrice / product.packageM2) : 0;
      items.push({
        id: 'parquet',
        name: `${product.brand} ${product.series} ${product.mm}mm ${product.class} ${product.beveled} (${packagesCount} Paket)`.trim(),
        unit: 'm²',
        qty: soldM2,
        priceExcl: m2Price,
        priceIncl: m2Price,
        total: calc.materialTotal,
        totalExcl: calc.materialTotal,
        kdv: 0,
        kdvAmount: 0
      });

      // 2. Labor Row
      const standardLaborCost = Number(jobM2) * Number(laborPrice);
      const removalCost = removalType === 'm2' ? (Number(jobM2) * Number(removalPrice)) : Number(removalPrice);
      const elevatorCost = elevatorType === 'm2' ? (Number(jobM2) * Number(elevatorPrice)) : Number(elevatorPrice);
      const furnishedCost = furnishedType === 'm2' ? (Number(jobM2) * Number(furnishedPrice)) : Number(furnishedPrice);
      const roadCost = Number(roadPrice);
      
      const laborItemTotal = standardLaborCost + removalCost + elevatorCost + furnishedCost + roadCost;
      const effectiveLaborRate = Number(jobM2) > 0 ? (laborItemTotal / Number(jobM2)) : 0;

      if (laborItemTotal > 0 && Number(jobM2) > 0) {
        items.push({
          id: 'labor',
          name: `Parke Döşeme İşçiliği & Ek Hizmetler (İşçilik: ${laborPrice}TL/m²` +
                (removalPrice > 0 ? `, Söküm: ${removalPrice}TL${removalType === 'm2' ? '/m²' : ' Sabit'}` : '') +
                (elevatorPrice > 0 ? `, Asansör Yok: ${elevatorPrice}TL${elevatorType === 'm2' ? '/m²' : ' Sabit'}` : '') +
                (furnishedPrice > 0 ? `, Eşyalı Ev: ${furnishedPrice}TL${furnishedType === 'm2' ? '/m²' : ' Sabit'}` : '') +
                (roadPrice > 0 ? `, Yol Ücreti: ${roadPrice}TL Sabit` : '') + ')',
          unit: 'm²',
          qty: Number(jobM2),
          priceExcl: effectiveLaborRate,
          priceIncl: effectiveLaborRate,
          total: laborItemTotal,
          totalExcl: laborItemTotal,
          kdv: 0,
          kdvAmount: 0
        });
      }

      // 3. Skirting Row
      if (skirtingType !== 'none' && calculatedSkirtingMeters > 0) {
        const skirtingName = 'Süpürgelik';
        const skirtingTotal = totalSkirtingPrice;
        items.push({
          id: 'skirting',
          name: skirtingName,
          unit: 'Metre',
          qty: calculatedSkirtingMeters,
          priceExcl: skirtingUnitPrice,
          priceIncl: skirtingUnitPrice,
          total: skirtingTotal,
          totalExcl: skirtingTotal,
          kdv: 0,
          kdvAmount: 0
        });
      }
    }

    onPrefillContract({
      items,
      description: ''
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Global parameters card */}
      <div className="card">
        <div className="form-section-title">Teklif & Fiyat Hesaplama Parametreleri</div>
        <div className="form-grid" style={{ marginBottom: '16px' }}>
          
          <div className="form-group">
            <label>Uygulama Alanı (m²)</label>
            <input
              type="number"
              className="form-input"
              value={jobM2 || ''}
              placeholder="0"
              min="0"
              onChange={(e) => {
                const val = Number(e.target.value) || 0;
                setJobM2(val);
              }}
            />
          </div>

          <div className="form-group">
            <label>Parke İşçilik (TL/m²)</label>
            <input
              type="number"
              className="form-input"
              value={laborPrice || ''}
              placeholder="0"
              min="0"
              onChange={(e) => setLaborPrice(Number(e.target.value) || 0)}
            />
          </div>

          <div className="form-group">
            <label>Eski Parke Söküm ({removalType === 'm2' ? 'TL/m²' : 'Sabit TL'})</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="number"
                className="form-input"
                style={{ flex: 1 }}
                value={removalPrice || ''}
                min="0"
                placeholder="0"
                onChange={(e) => setRemovalPrice(Number(e.target.value) || 0)}
              />
              <select
                className="form-select"
                style={{ width: '105px', padding: '10px 8px' }}
                value={removalType}
                onChange={(e) => setRemovalType(e.target.value)}
              >
                <option value="m2">TL/m²</option>
                <option value="fixed">Sabit TL</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Asansör Yok / Taşıma ({elevatorType === 'm2' ? 'TL/m²' : 'Sabit TL'})</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="number"
                className="form-input"
                style={{ flex: 1 }}
                value={elevatorPrice || ''}
                min="0"
                placeholder="0"
                onChange={(e) => setElevatorPrice(Number(e.target.value) || 0)}
              />
              <select
                className="form-select"
                style={{ width: '105px', padding: '10px 8px' }}
                value={elevatorType}
                onChange={(e) => setElevatorType(e.target.value)}
              >
                <option value="m2">TL/m²</option>
                <option value="fixed">Sabit TL</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Ev Eşyalı Farkı ({furnishedType === 'm2' ? 'TL/m²' : 'Sabit TL'})</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="number"
                className="form-input"
                style={{ flex: 1 }}
                value={furnishedPrice || ''}
                min="0"
                placeholder="0"
                onChange={(e) => setFurnishedPrice(Number(e.target.value) || 0)}
              />
              <select
                className="form-select"
                style={{ width: '105px', padding: '10px 8px' }}
                value={furnishedType}
                onChange={(e) => setFurnishedType(e.target.value)}
              >
                <option value="m2">TL/m²</option>
                <option value="fixed">Sabit TL</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Yol Ücreti (Sabit TL)</label>
            <input
              type="number"
              className="form-input"
              value={roadPrice || ''}
              min="0"
              placeholder="0"
              onChange={(e) => setRoadPrice(Number(e.target.value) || 0)}
            />
          </div>

          <div className="form-group">
            <label>Süpürgelik Seçeneği</label>
            <select
              className="form-select"
              value={skirtingType}
              onChange={(e) => {
                const type = e.target.value;
                setSkirtingType(type);
                if (type === 'yes' && skirtingUnitPrice === 0) {
                  setSkirtingUnitPrice(30);
                }
              }}
            >
              <option value="none">Süpürgelik Yok</option>
              <option value="yes">Süpürgelik Var</option>
            </select>
          </div>

          {skirtingType !== 'none' && (
            <>
              <div className="form-group">
                <label>Süpürgelik Birim Fiyatı (TL/m)</label>
                <input
                  type="number"
                  className="form-input"
                  value={skirtingUnitPrice || ''}
                  min="0"
                  placeholder="0"
                  onChange={(e) => setSkirtingUnitPrice(Number(e.target.value) || 0)}
                />
              </div>

              <div className="form-group">
                <label>Süpürgelik Metrajı (m)</label>
                <input
                  type="number"
                  className="form-input"
                  step="0.1"
                  min="0"
                  value={skirtingMeters !== '' ? skirtingMeters : (defaultSkirtingMeters || '')}
                  placeholder="0"
                  onChange={(e) => {
                    const val = e.target.value;
                    setSkirtingMeters(val === '' ? '' : Number(val));
                  }}
                />
              </div>
            </>
          )}

        </div>

      </div>

      {/* Product list comparison table */}
      <div className="card">
        <div className="search-filter-row" style={{ marginBottom: '20px' }}>
          <div className="search-box">
            <Search />
            <input
              type="text"
              className="form-input"
              placeholder="Marka, seri veya sınıf ile ürün ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <select
              className="form-select"
              style={{ width: '180px' }}
              value={brandFilter}
              onChange={(e) => setBrandFilter(e.target.value)}
            >
              <option value="hepsi">Tüm Markalar</option>
              {brands.filter(b => b !== 'hepsi').map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="items-table-wrapper" style={{ overflowX: 'auto' }}>
          <table className="items-table" style={{ minWidth: '1000px', fontSize: '13px' }}>
            <thead>
              <tr>
                <th style={{ width: '12%' }}>Marka / Seri</th>
                <th style={{ width: '8%' }}>Özellik</th>
                <th style={{ width: '8%' }}>Paket m²</th>
                <th style={{ width: '10%' }}>Paket Fiyatı</th>
                <th style={{ width: '10%' }}>m² Fiyatı</th>
                <th style={{ width: '8%' }}>Paket Adet</th>
                <th style={{ width: '12%' }}>Malzeme Tutarı</th>
                <th style={{ width: '12%' }}>İşçilik Toplam</th>
                <th style={{ width: '12%' }}>Genel Toplam</th>
                <th style={{ width: '12%', color: 'var(--secondary)' }}>%5 Düşerse (Nakit)</th>
                <th style={{ width: '150px' }}></th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p, idx) => {
                // Calculations per product row
                const m2Price = p.packagePrice > 0 ? (p.packagePrice / p.packageM2) : 0;
                
                // Kaç paket (Yukarı yuvarlayarak tam paket hesabı yapıyoruz)
                const packagesCount = p.packageM2 > 0 ? Math.ceil(jobM2 / p.packageM2) : 0;
                const soldM2 = Number((packagesCount * p.packageM2).toFixed(4));
                
                // Malzeme tutarı (Tam paket sayısı üzerinden hesaplanır)
                const materialTotal = p.packagePrice > 0 ? (packagesCount * p.packagePrice) : 0;
                
                // Labor total calculation based on m2 vs fixed choice
                const standardLaborCost = Number(jobM2) * Number(laborPrice);
                const removalCost = removalType === 'm2' ? (Number(jobM2) * Number(removalPrice)) : Number(removalPrice);
                const elevatorCost = elevatorType === 'm2' ? (Number(jobM2) * Number(elevatorPrice)) : Number(elevatorPrice);
                const furnishedCost = furnishedType === 'm2' ? (Number(jobM2) * Number(furnishedPrice)) : Number(furnishedPrice);
                const roadCost = Number(roadPrice);
                
                const laborTotal = standardLaborCost + removalCost + elevatorCost + furnishedCost + roadCost + totalSkirtingPrice;
                
                // Genel Toplam
                const grandTotal = materialTotal + laborTotal;
                
                // %5 Düşerse (divided by 1.05 like excel formula!)
                const totalWith5PctDiscount = grandTotal / 1.05;

                // For transferring to contract, keep a ref of KDV exclusions
                const materialTotalExcl = materialTotal; 
                const materialPriceIncl = soldM2 > 0 ? (materialTotal / soldM2) : 0;
                const materialPriceExcl = materialPriceIncl;

                const rowCalc = {
                  materialTotal,
                  materialTotalExcl,
                  materialPriceIncl,
                  materialPriceExcl,
                  totalWith5PctDiscount,
                  laborTotal,
                  grandTotal
                };

                return (
                  <tr key={idx} style={{ opacity: p.packagePrice === 0 ? 0.5 : 1 }}>
                    <td>
                      <div style={{ fontWeight: '700', color: 'var(--text-main)' }}>{p.brand}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{p.series || '-'}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: '600' }}>{p.mm}mm / {p.class}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{p.beveled}</div>
                    </td>
                    <td style={{ fontWeight: '600' }}>{p.packageM2} m²</td>
                    <td style={{ fontWeight: '600' }}>{p.packagePrice > 0 ? formatCurrency(p.packagePrice) : 'Fiyat Yok'}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{p.packagePrice > 0 ? formatCurrency(m2Price) : '-'}</td>
                    <td style={{ fontWeight: '600' }}>
                      <div style={{ fontWeight: '700', color: 'var(--text-main)' }}>{packagesCount} Paket</div>
                      <div style={{ fontSize: '11.5px', color: 'var(--primary)', fontWeight: '700' }}>({soldM2.toFixed(2)} m²)</div>
                    </td>
                    <td style={{ fontWeight: '700' }}>{p.packagePrice > 0 ? formatCurrency(materialTotal) : '-'}</td>
                    <td>{formatCurrency(laborTotal)}</td>
                    <td style={{ fontWeight: '800', color: 'var(--primary)' }}>{p.packagePrice > 0 ? formatCurrency(grandTotal) : '-'}</td>
                    <td style={{ fontWeight: '800', color: 'var(--secondary)' }}>{p.packagePrice > 0 ? formatCurrency(totalWith5PctDiscount) : '-'}</td>
                    <td style={{ minWidth: '150px' }}>
                      {p.packagePrice > 0 && (
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            type="button"
                            className="btn btn-secondary"
                            style={{ padding: '6px 8px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '2px', height: '28px' }}
                            title="Tüm kalemleri detaylı olarak sözleşmeye aktar"
                            onClick={() => handleTransfer(p, rowCalc, 'detailed')}
                          >
                            Detaylı
                          </button>
                          <button
                            type="button"
                            className="btn btn-primary"
                            style={{ padding: '6px 8px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '2px', height: '28px' }}
                            title="Tüm ek maliyetleri parke fiyatına yedirerek tek kalem olarak aktar"
                            onClick={() => handleTransfer(p, rowCalc, 'package')}
                          >
                            Paket <ChevronRight size={10} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
