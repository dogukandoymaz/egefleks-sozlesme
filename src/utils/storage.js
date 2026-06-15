// LocalStorage key definitions
const KEYS = {
  CONTRACTS: 'egefleks_contracts',
  CATALOG: 'egefleks_catalog',
  SETTINGS: 'egefleks_settings',
  PARQUET_CATALOG: 'egefleks_parquet_catalog',
  CATEGORIES: 'egefleks_categories',
};

// Default store settings based on the paper contract
const DEFAULT_SETTINGS = {
  storeName: 'Egefleks Yer Kaplamaları',
  companyTitle: 'EGEFLEKS YER KAPLAMALARI SANAYİ TİCARET LİMİTED ŞİRKETİ',
  address: 'Anadolu Cad. No: 463/B Dede Başı Mah. Karşıyaka / İZMİR',
  phone: '0 (541) 251 84 64 - 0 (232) 433 04 30',
  email: 'info@egeflekszemin.com',
  website: 'www.egeflekszemin.com',
  taxOffice: 'Çiğli V.D.',
  taxNo: '325 095 5027',
  bankInfo: 'Akbank: TR46 0004 6004 1088 8000 1330 42\nVakıfBank: TR89 0001 5001 5800 7308 3281 22',
  terms: [
    "Yukarıda niteliği ve türü yazılı olmayan ürünler ve uygulamalar ayrıca fiyatlandırılır.",
    "Ödemelerde meydana gelebilecek gecikmelerde, aylık %3,00 + Kdv vade farkı uygulanır.",
    "İş bitiminde, iş teslim formunun müşteri tarafından imzalanmaması, uygulamayı garanti kapsamı dışında bırakır.",
    "Uygulama yapılan mekanlarda; yapı ve imar durumundan kaynaklanan sorunlardan Egefleks san. ve tic. şti. sorumlu tutulamaz.",
    "Verilen montaj tarihinden itibaren, elimizde olmayan sebeplerden dolayı (elektrik kesintisi, iş kazaları vb.) 15 iş gününe kadar gecikme olabilir.",
    "Peşin veya vadeli satışlarda, işin toplam tutarı tahsil olana kadar, yapılan uygulama ve kullanılan malzemeler Egefleks san. ve tic. şti. mülkiyetindedir.",
    "Egefleks, uygulamayı standartlarına uygun yapmayı taahhüt eder. Doğal afet ve kullanımdan kaynaklanan kusurlardan dolayı Egefleks san. ve tic. şti. sorumlu değildir.",
    "Egefleksçe kararlaştırılan paket miktarını getirmekle yükümlüdür, gelen malzeme montaj için yetmediğinde kalan malzeme tedariği müşteri sorumluluğundadır.",
    "Eşyalı dairelerde müşteri eşyanın başında durmakla sorumludur, eşyaların taşınması ve parke montajı sırasında oluşabilecek zararlardan firmamız sorumlu tutulamaz, aksi durumlarda ustaya yevmiye ücreti yansıtılır.",
    "Kararlaştırılan uygulama tarihinde olabilecek değişikliklerin, en az 48 saat önce Egefleks san. ve tic. şti.'ne bildirilmesi gerekmektedir. Bildirilmeyen durumlarda ustaya yevmiye ücreti alınır.",
    "Alıcının teslim aldığı ürünleri kontrol etme mükellefiyeti olup yukarıda yazılı ürünleri imza karşılığı teslim alması ile bundan sonra eksik ürün alma ve ayıplı ürün alma itirazları ortadan kalkmaktadır."
  ]
};

// Default product catalog
const DEFAULT_CATALOG = [
  { id: '1', name: 'Çamsan Silver Rüzgar Meşe', unit: 'm²', defaultPrice: 630 },
  { id: '2', name: 'Çamsan Modern Meşe 8mm', unit: 'm²', defaultPrice: 650 },
  { id: '3', name: '6cm Süpürgelik (MDF)', unit: 'm', defaultPrice: 120 },
  { id: '4', name: 'Alüminyum Derz Kapama Profili', unit: 'Adet', defaultPrice: 150 },
  { id: '5', name: 'Parke Montaj İşçiliği', unit: 'm²', defaultPrice: 100 },
  { id: '6', name: 'Süpürgelik Montaj Dahil', unit: 'm', defaultPrice: 50 },
  { id: '7', name: 'Kapı Kesme', unit: 'Adet', defaultPrice: 200 }
];

// Default parquet catalog for comparison calculator
const DEFAULT_PARQUET_CATALOG = [
  { brand: 'M', series: 'NATURA LİNE', class: '32-AC4', beveled: 'DERZLİ', mm: 8, packageM2: 1.8336, packagePrice: 970 },
  { brand: 'AGT', series: 'EFFECT', class: '32-AC4', beveled: 'DERZLİ', mm: 8, packageM2: 1.8336, packagePrice: 970 },
  { brand: 'AGT', series: 'EFFECT', class: '33-AC5', beveled: 'DERZLİ(PREMİUM)', mm: 12, packageM2: 1.3551, packagePrice: 1070 },
  { brand: 'AGT', series: 'YOGA', class: '32-AC4', beveled: 'DERZLİ', mm: 8, packageM2: 1.8336, packagePrice: 970 },
  { brand: 'AGT', series: 'YOGA', class: '33-AC5', beveled: 'DERZLİ(PREMİUM)', mm: 12, packageM2: 1.8336, packagePrice: 1420 },
  { brand: 'AGT', series: 'BELLA', class: '31-AC3', beveled: 'DERZSİZ', mm: 8, packageM2: 2.2920, packagePrice: 1050 },
  { brand: 'ÇAMSAN', series: 'SİLVER', class: '31-AC3', beveled: 'DERZSİZ', mm: 8, packageM2: 1.8400, packagePrice: 900 },
  { brand: 'ÇAMSAN', series: 'KLASİK', class: '31-AC3', beveled: 'DERZSİZ', mm: 8, packageM2: 1.8400, packagePrice: 920 },
  { brand: 'ÇAMSAN', series: 'KLASİK (K)', class: '32-AC4', beveled: 'DERZSİZ', mm: 8, packageM2: 1.8400, packagePrice: 920 },
  { brand: 'ÇAMSAN', series: 'GLORİA (K)', class: '32-AC4', beveled: 'DERZLİ', mm: 8, packageM2: 2.1300, packagePrice: 1300 },
  { brand: 'ÇAMSAN', series: 'PLATİNUM (K)', class: '32-AC4', beveled: 'DERZLİ', mm: 10, packageM2: 1.8400, packagePrice: 1200 },
  { brand: 'ÇAMSAN', series: 'AVANGARD (K)', class: '32-AC4', beveled: 'DERZLİ', mm: 10, packageM2: 1.5700, packagePrice: 1375 },
  { brand: 'ÇAMSAN', series: 'MODERN LONG(K)', class: '32-AC4', beveled: 'DERZLİ', mm: 8, packageM2: 2.1300, packagePrice: 1150 },
  { brand: 'ÇAMSAN', series: 'ZEN', class: '32-AC4', beveled: 'DERZLİ', mm: 8, packageM2: 1.8528, packagePrice: 1100 },
  { brand: 'ÇAMSAN', series: 'EXCLUSIVE', class: '32-AC4', beveled: 'DERZLİ', mm: 8, packageM2: 1.8528, packagePrice: 0 },
  { brand: 'ÇAMSAN', series: 'AURA(K)', class: '32-AC', beveled: 'DERZSİZ', mm: 8, packageM2: 1.8528, packagePrice: 0 },
  { brand: 'FLOORPAN', series: 'FİX (K)', class: '31-AC3', beveled: 'DERZSİZ', mm: 7, packageM2: 2.8400, packagePrice: 1100 },
  { brand: 'FLOORPAN', series: 'SUNEX', class: '31-AC3', beveled: 'DERZLİ', mm: 8, packageM2: 2.3740, packagePrice: 1070 },
  { brand: 'FLOORPAN', series: 'ORİON', class: '32-AC4', beveled: 'DERZLİ', mm: 10, packageM2: 1.5134, packagePrice: 1150 },
  { brand: 'FLOORPAN', series: 'ORİON', class: '32-AC4', beveled: 'DERZLİ', mm: 12, packageM2: 1.2821, packagePrice: 1250 },
  { brand: 'FLOORPAN', series: 'PRIME', class: '32-AC4', beveled: 'DERZLİ', mm: 8, packageM2: 1.8600, packagePrice: 930 },
  { brand: 'FLOORPAN', series: 'SUN', class: '31-AC3', beveled: 'DERZSİZ', mm: 8, packageM2: 2.3740, packagePrice: 1000 },
  { brand: 'FLOORPAN', series: 'CLASSİC', class: '32-AC4', beveled: 'DERZSİZ', mm: 8, packageM2: 1.8900, packagePrice: 900 },
  { brand: 'KRONO', series: 'VİNTAGE', class: '32-AC4', beveled: 'DERZLİ', mm: 10, packageM2: 1.9200, packagePrice: 1350 },
  { brand: 'KRONO', series: 'MODERA', class: '32-AC4', beveled: 'DERZLİ', mm: 8, packageM2: 1.9200, packagePrice: 1000 },
  { brand: 'PELİ', series: 'GOLDEN', class: '32-AC4', beveled: 'DERZLİ', mm: 8, packageM2: 1.9608, packagePrice: 1000 },
  { brand: 'PELİ', series: 'ELEGANCE', class: '32-AC4', beveled: 'DERZSİZ', mm: 8, packageM2: 1.9608, packagePrice: 1000 },
  { brand: 'PELİ', series: 'COMFORT', class: '31-AC3', beveled: 'DERZSİZ', mm: 8, packageM2: 1.9608, packagePrice: 800 },
  { brand: 'TERRA CLICK', series: '', class: '31-AC3', beveled: 'DERZSİZ', mm: 8, packageM2: 2.3071, packagePrice: 1000 }
];

// Helper to check and initialize localStorage values
const initStorage = () => {
  if (!localStorage.getItem(KEYS.SETTINGS)) {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
  } else {
    // Migration: Update bankInfo if it contains old mock values or Garanti bank details
    try {
      const currentSettings = localStorage.getItem(KEYS.SETTINGS);
      if (currentSettings) {
        const parsed = JSON.parse(currentSettings);
        if (parsed.bankInfo && (parsed.bankInfo.includes('...') || parsed.bankInfo.includes('Garanti'))) {
          parsed.bankInfo = DEFAULT_SETTINGS.bankInfo;
          localStorage.setItem(KEYS.SETTINGS, JSON.stringify(parsed));
        }
      }
    } catch (e) {
      console.error('Settings migration error:', e);
    }
  }
  if (!localStorage.getItem(KEYS.CATALOG)) {
    localStorage.setItem(KEYS.CATALOG, JSON.stringify(DEFAULT_CATALOG));
  }
  if (!localStorage.getItem(KEYS.CONTRACTS)) {
    localStorage.setItem(KEYS.CONTRACTS, JSON.stringify([]));
  }
  if (!localStorage.getItem(KEYS.PARQUET_CATALOG)) {
    const parquetWithIds = DEFAULT_PARQUET_CATALOG.map((p, idx) => ({
      ...p,
      id: (idx + 1).toString()
    }));
    localStorage.setItem(KEYS.PARQUET_CATALOG, JSON.stringify(parquetWithIds));
  }
  if (!localStorage.getItem(KEYS.CATEGORIES)) {
    localStorage.setItem(KEYS.CATEGORIES, JSON.stringify(['Sözleşme Kalemleri']));
  }
};

// Initialize right away
initStorage();

const apiPost = (url, data) => {
  const token = localStorage.getItem('egefleks_auth_token');
  fetch(url, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    },
    body: JSON.stringify(data)
  }).catch(err => console.error(`API Sync Post Error on ${url}:`, err));
};

const apiDelete = (url) => {
  const token = localStorage.getItem('egefleks_auth_token');
  fetch(url, {
    method: 'DELETE',
    headers: {
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    }
  }).catch(err => console.error(`API Sync Delete Error on ${url}:`, err));
};

export const Storage = {
  // Settings API
  getSettings() {
    initStorage();
    return JSON.parse(localStorage.getItem(KEYS.SETTINGS));
  },
  saveSettings(settings) {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
    apiPost('/api/settings', settings);
    return settings;
  },

  // Catalog API
  getCatalog() {
    initStorage();
    return JSON.parse(localStorage.getItem(KEYS.CATALOG));
  },
  saveCatalog(catalog) {
    localStorage.setItem(KEYS.CATALOG, JSON.stringify(catalog));
    apiPost('/api/catalog', catalog);
    return catalog;
  },
  addCatalogItem(item) {
    const catalog = this.getCatalog();
    const newItem = { ...item, id: Date.now().toString() };
    catalog.push(newItem);
    this.saveCatalog(catalog);
    return newItem;
  },
  updateCatalogItem(updatedItem) {
    let catalog = this.getCatalog();
    catalog = catalog.map(item => item.id === updatedItem.id ? updatedItem : item);
    this.saveCatalog(catalog);
    return updatedItem;
  },
  deleteCatalogItem(id) {
    let catalog = this.getCatalog();
    catalog = catalog.filter(item => item.id !== id);
    this.saveCatalog(catalog);
  },

  // Contracts API
  getContracts() {
    initStorage();
    return JSON.parse(localStorage.getItem(KEYS.CONTRACTS));
  },
  getContractById(id) {
    const contracts = this.getContracts();
    return contracts.find(c => c.id === id);
  },
  saveContract(contract) {
    const contracts = this.getContracts();
    let updatedContracts;
    let targetContract;

    if (contract.id) {
      // Edit existing
      targetContract = { ...contract, updatedAt: new Date().toISOString() };
      updatedContracts = contracts.map(c => c.id === contract.id ? targetContract : c);
    } else {
      // Create new
      const maxNo = contracts.reduce((max, c) => Number(c.contractNumber) > max ? Number(c.contractNumber) : max, 1007);
      targetContract = {
        ...contract,
        id: Date.now().toString(),
        contractNumber: (maxNo + 1),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      contracts.push(targetContract);
      updatedContracts = contracts;
    }

    localStorage.setItem(KEYS.CONTRACTS, JSON.stringify(updatedContracts));
    apiPost('/api/contracts', targetContract);
    return targetContract;
  },
  deleteContract(id) {
    let contracts = this.getContracts();
    contracts = contracts.filter(c => c.id !== id);
    localStorage.setItem(KEYS.CONTRACTS, JSON.stringify(contracts));
    apiDelete('/api/contracts/' + id);
  },
  updateContractStatus(id, status) {
    const contracts = this.getContracts();
    let targetContract;
    const updated = contracts.map(c => {
      if (c.id === id) {
        targetContract = { ...c, status, updatedAt: new Date().toISOString() };
        return targetContract;
      }
      return c;
    });
    localStorage.setItem(KEYS.CONTRACTS, JSON.stringify(updated));
    if (targetContract) {
      apiPost('/api/contracts', targetContract);
    }
  },

  // Parquet Catalog API
  getParquetCatalog() {
    initStorage();
    return JSON.parse(localStorage.getItem(KEYS.PARQUET_CATALOG)) || [];
  },
  saveParquetCatalog(catalog) {
    localStorage.setItem(KEYS.PARQUET_CATALOG, JSON.stringify(catalog));
    apiPost('/api/parquet', catalog);
    return catalog;
  },
  addParquetItem(item) {
    const catalog = this.getParquetCatalog();
    const newItem = { ...item, id: Date.now().toString() };
    catalog.push(newItem);
    this.saveParquetCatalog(catalog);
    return newItem;
  },
  updateParquetItem(updatedItem) {
    let catalog = this.getParquetCatalog();
    catalog = catalog.map(item => item.id === updatedItem.id ? updatedItem : item);
    this.saveParquetCatalog(catalog);
    return updatedItem;
  },
  deleteParquetItem(id) {
    let catalog = this.getParquetCatalog();
    catalog = catalog.filter(item => item.id !== id);
    this.saveParquetCatalog(catalog);
  },

  // Categories API
  getCategories() {
    initStorage();
    try {
      const cats = localStorage.getItem(KEYS.CATEGORIES);
      return cats ? JSON.parse(cats) : ['Sözleşme Kalemleri'];
    } catch {
      return ['Sözleşme Kalemleri'];
    }
  },
  saveCategories(cats) {
    localStorage.setItem(KEYS.CATEGORIES, JSON.stringify(cats));
    apiPost('/api/categories', cats);
    return cats;
  }
};
