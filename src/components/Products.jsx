import { useState } from 'react';
import { Storage } from '../utils/storage';
import { 
  Layers, 
  List, 
  Plus, 
  Trash2, 
  Edit, 
  CheckCircle2, 
  Search 
} from 'lucide-react';

export default function Products() {
  const [activeTab, setActiveTab] = useState('parquet'); // 'parquet' | categoryName
  const [parquetCatalog, setParquetCatalog] = useState(() => Storage.getParquetCatalog());
  const [catalog, setCatalog] = useState(() => Storage.getCatalog());
  const [categories, setCategories] = useState(() => Storage.getCategories());
  const [searchTerm, setSearchTerm] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Contract Item Form state
  const [editingCatalogId, setEditingCatalogId] = useState(null);
  const [newItemName, setNewItemName] = useState('');
  const [newItemUnit, setNewItemUnit] = useState('m²');
  const [newItemPrice, setNewItemPrice] = useState(0);

  // Parquet Form state
  const [editingParquetId, setEditingParquetId] = useState(null);
  const [parquetBrand, setParquetBrand] = useState('');
  const [parquetSeries, setParquetSeries] = useState('');
  const [parquetClass, setParquetClass] = useState('32-AC4');
  const [parquetBeveled, setParquetBeveled] = useState('DERZLİ');
  const [parquetMm, setParquetMm] = useState(8);
  const [parquetPackageM2, setParquetPackageM2] = useState(1.8336);
  const [parquetPackagePrice, setParquetPackagePrice] = useState(970);
  const [parquetM2Price, setParquetM2Price] = useState(529.01);

  const triggerSuccessAlert = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleCreateCategory = () => {
    const name = prompt('Yeni ürün kategorisi adı girin (Örn: Halılar):');
    if (!name) return;
    const trimmed = name.trim();
    if (!trimmed) return;
    if (trimmed.toLowerCase() === 'parquet' || trimmed.toLowerCase() === 'parkeler') {
      alert('Bu kategori adı rezerve edilmiştir.');
      return;
    }
    if (categories.some(c => c.toLowerCase() === trimmed.toLowerCase())) {
      alert('Bu isimde bir kategori zaten mevcut.');
      return;
    }

    const updated = [...categories, trimmed];
    Storage.saveCategories(updated);
    setCategories(updated);
    setActiveTab(trimmed);
    triggerSuccessAlert(`"${trimmed}" kategorisi oluşturuldu.`);
  };

  const handleDeleteCategory = (catName) => {
    if (window.confirm(`"${catName}" kategorisini ve bu kategoriye ait tüm ürünleri silmek istediğinizden emin misiniz?`)) {
      const updatedCats = categories.filter(c => c !== catName);
      Storage.saveCategories(updatedCats);
      setCategories(updatedCats);

      const allItems = Storage.getCatalog();
      const remainingItems = allItems.filter(item => item.category !== catName);
      Storage.saveCatalog(remainingItems);
      setCatalog(remainingItems);

      setActiveTab('parquet');
      triggerSuccessAlert(`"${catName}" kategorisi ve ürünleri silindi.`);
    }
  };

  // --- CONTRACT ITEM HANDLERS ---
  const handleSaveCatalogItem = (e) => {
    e.preventDefault();
    if (!newItemName) return;

    const itemData = {
      name: newItemName,
      unit: newItemUnit,
      defaultPrice: Number(newItemPrice),
      category: activeTab
    };

    if (editingCatalogId) {
      const updated = { ...itemData, id: editingCatalogId };
      Storage.updateCatalogItem(updated);
      setCatalog(catalog.map(item => item.id === editingCatalogId ? updated : item));
      setEditingCatalogId(null);
      triggerSuccessAlert('Ürün başarıyla güncellendi!');
    } else {
      const added = Storage.addCatalogItem(itemData);
      setCatalog([...catalog, added]);
      triggerSuccessAlert('Ürün kataloğa eklendi!');
    }

    setNewItemName('');
    setNewItemPrice(0);
    setNewItemUnit('m²');
  };

  const handleEditCatalogItem = (item) => {
    setEditingCatalogId(item.id);
    setNewItemName(item.name);
    setNewItemUnit(item.unit || 'm²');
    setNewItemPrice(item.defaultPrice || 0);
  };

  const handleDeleteCatalogItem = (id) => {
    if (window.confirm('Bu ürünü katalogdan silmek istediğinize emin misiniz?')) {
      Storage.deleteCatalogItem(id);
      setCatalog(catalog.filter(item => item.id !== id));
      triggerSuccessAlert('Ürün katalogdan silindi.');
      if (editingCatalogId === id) {
        setEditingCatalogId(null);
        setNewItemName('');
        setNewItemPrice(0);
        setNewItemUnit('m²');
      }
    }
  };

  // --- PARQUET HANDLERS ---
  const handleSaveParquet = (e) => {
    e.preventDefault();
    if (!parquetBrand) return;

    const parquetData = {
      brand: parquetBrand,
      series: parquetSeries,
      class: parquetClass,
      beveled: parquetBeveled,
      mm: Number(parquetMm),
      packageM2: Number(parquetPackageM2),
      packagePrice: Number(parquetPackagePrice)
    };

    if (editingParquetId) {
      const updated = { ...parquetData, id: editingParquetId };
      Storage.updateParquetItem(updated);
      setParquetCatalog(parquetCatalog.map(p => p.id === editingParquetId ? updated : p));
      setEditingParquetId(null);
      triggerSuccessAlert('Parke ürünü başarıyla güncellendi!');
    } else {
      const added = Storage.addParquetItem(parquetData);
      setParquetCatalog([...parquetCatalog, added]);
      triggerSuccessAlert('Yeni parke ürünü eklendi!');
    }

    // Reset fields
    setParquetBrand('');
    setParquetSeries('');
    setParquetClass('32-AC4');
    setParquetBeveled('DERZLİ');
    setParquetMm(8);
    setParquetPackageM2(1.8336);
    setParquetPackagePrice(970);
    setParquetM2Price(529.01);
  };

  const handleEditParquet = (item) => {
    setEditingParquetId(item.id);
    setParquetBrand(item.brand);
    setParquetSeries(item.series || '');
    setParquetClass(item.class || '32-AC4');
    setParquetBeveled(item.beveled || 'DERZLİ');
    setParquetMm(item.mm || 8);
    setParquetPackageM2(item.packageM2 || 1.8336);
    setParquetPackagePrice(item.packagePrice || 0);
    const m2Price = item.packagePrice > 0 && item.packageM2 > 0
      ? Number((item.packagePrice / item.packageM2).toFixed(2))
      : 0;
    setParquetM2Price(m2Price);
  };

  const handleDeleteParquet = (id) => {
    if (window.confirm('Bu parke ürününü silmek istediğinize emin misiniz?')) {
      Storage.deleteParquetItem(id);
      setParquetCatalog(parquetCatalog.filter(p => p.id !== id));
      triggerSuccessAlert('Parke ürünü silindi.');
      if (editingParquetId === id) {
        setEditingParquetId(null);
        setParquetBrand('');
        setParquetSeries('');
        setParquetClass('32-AC4');
        setParquetBeveled('DERZLİ');
        setParquetMm(8);
        setParquetPackageM2(1.8336);
        setParquetPackagePrice(970);
        setParquetM2Price(529.01);
      }
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(val);
  };

  // --- FILTERS ---
  const filteredParquet = parquetCatalog.filter(p => {
    const term = searchTerm.toLowerCase();
    return (
      p.brand.toLowerCase().includes(term) ||
      (p.series && p.series.toLowerCase().includes(term)) ||
      (p.class && p.class.toLowerCase().includes(term))
    );
  });

  const filteredCatalog = catalog.filter(item => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = item.name.toLowerCase().includes(term);
    const matchesCategory = activeTab === 'Sözleşme Kalemleri'
      ? (!item.category || item.category === 'Sözleşme Kalemleri')
      : item.category === activeTab;
    return matchesSearch && matchesCategory;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Top Header & Alert Banner */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border)', paddingBottom: '6px', flexWrap: 'wrap', alignItems: 'center', flex: 1 }}>
          <button 
            type="button"
            className={`btn ${activeTab === 'parquet' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => {
              setActiveTab('parquet');
              setSearchTerm('');
            }}
            style={{ padding: '8px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', height: '36px' }}
          >
            <Layers size={14} /> Parkeler
          </button>

          {categories.map(cat => (
            <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: '2px', backgroundColor: activeTab === cat ? 'var(--primary-light)' : 'transparent', borderRadius: 'var(--radius-sm)' }}>
              <button 
                type="button"
                className={`btn ${activeTab === cat ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => {
                  setActiveTab(cat);
                  setSearchTerm('');
                }}
                style={{ padding: '8px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', height: '36px' }}
              >
                <List size={14} /> {cat}
              </button>
              {cat !== 'Sözleşme Kalemleri' && (
                <button
                  type="button"
                  className="table-action-btn"
                  style={{ padding: '6px', height: '36px', display: 'flex', alignItems: 'center', color: '#ef4444', border: 'none', background: 'transparent' }}
                  onClick={() => handleDeleteCategory(cat)}
                  title={`"${cat}" kategorisini sil`}
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}

          <button 
            type="button"
            className="btn btn-secondary btn-icon-only"
            onClick={handleCreateCategory}
            style={{ padding: '8px', height: '36px', width: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title="Yeni Kategori Ekle"
          >
            <Plus size={16} />
          </button>
        </div>

        {successMsg && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', padding: '8px 16px', borderRadius: 'var(--radius-sm)', fontWeight: '600', fontSize: '14px' }}>
            <CheckCircle2 size={16} />
            {successMsg}
          </div>
        )}
      </div>

      {/* Main Grid */}
      <div className="settings-grid">
        
        {/* LEFT COLUMN: FORM */}
        <div className="card">
          {activeTab === 'parquet' ? (
            <form onSubmit={handleSaveParquet}>
              <div className="form-section-title" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '10px', marginBottom: '16px' }}>
                <Layers size={18} />
                {editingParquetId ? 'Parke Ürününü Düzenle' : 'Yeni Parke Ürünü Ekle'}
              </div>
              
              <div className="form-grid">
                <div className="form-group">
                  <label>Marka</label>
                  <input 
                    type="text" 
                    required 
                    className="form-input" 
                    placeholder="Örn: AGT, Çamsan"
                    value={parquetBrand}
                    onChange={(e) => setParquetBrand(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Seri / Model</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Örn: Effect, Silver"
                    value={parquetSeries}
                    onChange={(e) => setParquetSeries(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Sınıf</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Örn: 32-AC4, 33-AC5"
                    value={parquetClass}
                    onChange={(e) => setParquetClass(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Derz Durumu</label>
                  <select 
                    className="form-select"
                    value={parquetBeveled}
                    onChange={(e) => setParquetBeveled(e.target.value)}
                  >
                    <option value="DERZLİ">DERZLİ</option>
                    <option value="DERZSİZ">DERZSİZ</option>
                    <option value="DERZLİ(PREMİUM)">DERZLİ(PREMİUM)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Kalınlık (mm)</label>
                  <input 
                    type="number" 
                    required 
                    min="0"
                    className="form-input" 
                    placeholder="8"
                    value={parquetMm || ''}
                    onChange={(e) => setParquetMm(Number(e.target.value) || 0)}
                  />
                </div>

                <div className="form-group">
                  <label>Paket m²</label>
                  <input 
                    type="number" 
                    required 
                    step="any" 
                    min="0"
                    className="form-input" 
                    placeholder="1.8336"
                    value={parquetPackageM2 || ''}
                    onChange={(e) => {
                      const m2Val = Number(e.target.value) || 0;
                      setParquetPackageM2(m2Val);
                      if (m2Val > 0) {
                        setParquetM2Price(Number((parquetPackagePrice / m2Val).toFixed(2)));
                      } else {
                        setParquetM2Price(0);
                      }
                    }}
                  />
                </div>

                <div className="form-group">
                  <label>Paket Fiyatı (TL)</label>
                  <input 
                    type="number" 
                    required 
                    step="any"
                    min="0"
                    className="form-input" 
                    placeholder="0"
                    value={parquetPackagePrice || ''}
                    onChange={(e) => {
                      const priceVal = Number(e.target.value) || 0;
                      setParquetPackagePrice(priceVal);
                      if (parquetPackageM2 > 0) {
                        setParquetM2Price(Number((priceVal / parquetPackageM2).toFixed(2)));
                      }
                    }}
                  />
                </div>

                <div className="form-group">
                  <label>m² Fiyatı (TL)</label>
                  <input 
                    type="number" 
                    required 
                    step="any"
                    min="0"
                    className="form-input" 
                    placeholder="0"
                    value={parquetM2Price || ''}
                    onChange={(e) => {
                      const m2PriceVal = Number(e.target.value) || 0;
                      setParquetM2Price(m2PriceVal);
                      if (parquetPackageM2 > 0) {
                        setParquetPackagePrice(Number((m2PriceVal * parquetPackageM2).toFixed(2)));
                      }
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  <Plus size={16} /> {editingParquetId ? 'Güncelle' : 'Parke Ekle'}
                </button>
                {editingParquetId && (
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    style={{ flex: 0.5 }}
                    onClick={() => {
                      setEditingParquetId(null);
                      setParquetBrand('');
                      setParquetSeries('');
                      setParquetClass('32-AC4');
                      setParquetBeveled('DERZLİ');
                      setParquetMm(8);
                      setParquetPackageM2(1.8336);
                      setParquetPackagePrice(970);
                    }}
                  >
                    Vazgeç
                  </button>
                )}
              </div>
            </form>
          ) : (
            <form onSubmit={handleSaveCatalogItem}>
              <div className="form-section-title" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '10px', marginBottom: '16px' }}>
                <List size={18} />
                {editingCatalogId ? 'Sözleşme Kalemini Düzenle' : 'Yeni Sözleşme Kalemi Ekle'}
              </div>

              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Malzeme/Hizmet Adı</label>
                  <input 
                    type="text" 
                    required 
                    className="form-input" 
                    placeholder="Örn: MDF Süpürgelik 6cm"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Birim</label>
                  <select 
                    className="form-select"
                    value={newItemUnit}
                    onChange={(e) => setNewItemUnit(e.target.value)}
                  >
                    <option value="m²">m²</option>
                    <option value="m">m (Metre)</option>
                    <option value="Adet">Adet</option>
                    <option value="Paket">Paket</option>
                    <option value="Hizmet">Hizmet</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Birim Fiyatı (TL)</label>
                  <input 
                    type="number" 
                    required 
                    min="0"
                    className="form-input" 
                    placeholder="0"
                    value={newItemPrice || ''}
                    onChange={(e) => setNewItemPrice(Number(e.target.value))}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  <Plus size={16} /> {editingCatalogId ? 'Güncelle' : 'Kalemi Ekle'}
                </button>
                {editingCatalogId && (
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    style={{ flex: 0.5 }}
                    onClick={() => {
                      setEditingCatalogId(null);
                      setNewItemName('');
                      setNewItemPrice(0);
                      setNewItemUnit('m²');
                    }}
                  >
                    Vazgeç
                  </button>
                )}
              </div>
            </form>
          )}
        </div>

        {/* RIGHT COLUMN: LIST */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Search Input */}
          <div className="search-box">
            <Search size={18} />
            <input 
              type="text" 
              className="form-input" 
              placeholder={activeTab === 'parquet' ? "Marka, seri veya sınıfa göre ara..." : "Ürün adına göre ara..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {activeTab === 'parquet' ? (
            <>
              <div className="form-section-title">Mevcut Parkeler ({filteredParquet.length})</div>
              <div className="items-table-wrapper" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                <table className="items-table" style={{ fontSize: '13px' }}>
                  <thead>
                    <tr>
                      <th>Ürün Bilgisi</th>
                      <th>Kalınlık/Derz/Sınıf</th>
                      <th>Paket m² / Fiyat</th>
                      <th style={{ width: '80px' }}>İşlem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredParquet.length > 0 ? (
                      filteredParquet.map(item => (
                        <tr key={item.id}>
                          <td>
                            <div style={{ fontWeight: '700', color: 'var(--text-main)' }}>{item.brand}</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '11px' }}>{item.series || '-'}</div>
                          </td>
                          <td>
                            <div>{item.mm}mm / {item.class}</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '11px' }}>{item.beveled}</div>
                          </td>
                          <td>
                            <div>{item.packageM2} m²</div>
                            <div style={{ fontWeight: '700', color: 'var(--primary)' }}>
                              {item.packagePrice > 0 ? formatCurrency(item.packagePrice) : 'Fiyat Yok'}
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button 
                                type="button" 
                                className="table-action-btn"
                                onClick={() => handleEditParquet(item)}
                                title="Düzenle"
                              >
                                <Edit size={14} />
                              </button>
                              <button 
                                type="button" 
                                className="table-action-btn"
                                onClick={() => handleDeleteParquet(item.id)}
                                title="Sil"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                          Aramaya uygun parke bulunamadı.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <>
              <div className="form-section-title">Mevcut Sözleşme Kalemleri ({filteredCatalog.length})</div>
              <div className="items-table-wrapper" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                <table className="items-table" style={{ fontSize: '13px' }}>
                  <thead>
                    <tr>
                      <th>Malzeme Adı</th>
                      <th>Birim</th>
                      <th>Varsayılan Fiyat</th>
                      <th style={{ width: '80px' }}>İşlem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCatalog.length > 0 ? (
                      filteredCatalog.map(item => (
                        <tr key={item.id}>
                          <td style={{ fontWeight: '600', color: 'var(--text-main)' }}>{item.name}</td>
                          <td>
                            <span className="badge badge-secondary" style={{ backgroundColor: 'var(--bg-app)', color: 'var(--text-main)', fontSize: '11px', padding: '4px 8px' }}>
                              {item.unit}
                            </span>
                          </td>
                          <td style={{ fontWeight: '700', color: 'var(--primary)' }}>
                            {formatCurrency(item.defaultPrice)}
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button 
                                type="button" 
                                className="table-action-btn"
                                onClick={() => handleEditCatalogItem(item)}
                                title="Düzenle"
                              >
                                <Edit size={14} />
                              </button>
                              <button 
                                type="button" 
                                className="table-action-btn"
                                onClick={() => handleDeleteCatalogItem(item.id)}
                                title="Sil"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                          Aramaya uygun ürün bulunamadı.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

        </div>

      </div>

    </div>
  );
}
