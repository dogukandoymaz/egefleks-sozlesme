/* eslint-disable no-undef */
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'db.json');

// In-memory active session tokens
const activeSessions = new Set();

app.use(cors());
app.use(express.json({ limit: '15mb' })); // Increased limit to support base64 signature images

// Default structures
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

const DEFAULT_CATALOG = [
  { id: '1', name: 'Çamsan Silver Rüzgar Meşe', unit: 'm²', defaultPrice: 630 },
  { id: '2', name: 'Çamsan Modern Meşe 8mm', unit: 'm²', defaultPrice: 650 },
  { id: '3', name: '6cm Süpürgelik (MDF)', unit: 'm', defaultPrice: 120 },
  { id: '4', name: 'Alüminyum Derz Kapama Profili', unit: 'Adet', defaultPrice: 150 },
  { id: '5', name: 'Parke Montaj İşçiliği', unit: 'm²', defaultPrice: 100 },
  { id: '6', name: 'Süpürgelik Montaj Dahil', unit: 'm', defaultPrice: 50 },
  { id: '7', name: 'Kapı Kesme', unit: 'Adet', defaultPrice: 200 }
];

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

const readDb = () => {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const initDb = {
        settings: DEFAULT_SETTINGS,
        catalog: DEFAULT_CATALOG,
        parquetCatalog: DEFAULT_PARQUET_CATALOG.map((p, i) => ({ ...p, id: (i + 1).toString() })),
        contracts: [],
        categories: ['Sözleşme Kalemleri']
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(initDb, null, 2), 'utf-8');
      return initDb;
    }
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Database read error:', err);
    return {};
  }
};

const writeDb = (data) => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Database write error:', err);
  }
};

// Authentication Middleware
const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing token' });
  }
  const token = authHeader.split(' ')[1];
  if (!activeSessions.has(token)) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
  }
  next();
};

// Public Authentication Routes
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const adminUser = process.env.ADMIN_USERNAME || 'admin';
  const adminPass = process.env.ADMIN_PASSWORD || 'egefleks123';

  if (username === adminUser && password === adminPass) {
    const token = crypto.randomUUID();
    activeSessions.add(token);
    return res.json({ success: true, token });
  }

  res.status(401).json({ success: false, error: 'Kullanıcı adı veya şifre hatalı' });
});

app.post('/api/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    activeSessions.delete(token);
  }
  res.json({ success: true });
});

// API Endpoints
app.get('/api/db', requireAuth, (req, res) => {
  res.json(readDb());
});

app.post('/api/contracts', requireAuth, (req, res) => {
  const db = readDb();
  const contract = req.body;
  if (!contract.id) {
    contract.id = Date.now().toString();
  }
  const existingIdx = db.contracts.findIndex(c => c.id === contract.id);
  if (existingIdx > -1) {
    db.contracts[existingIdx] = contract;
  } else {
    if (!contract.contractNumber) {
      const lastNumber = db.contracts.length > 0
        ? Math.max(...db.contracts.map(c => Number(c.contractNumber) || 1000))
        : 1000;
      contract.contractNumber = (lastNumber + 1).toString();
    }
    db.contracts.push(contract);
  }
  writeDb(db);
  res.json({ success: true, contract });
});

app.delete('/api/contracts/:id', requireAuth, (req, res) => {
  const db = readDb();
  db.contracts = db.contracts.filter(c => c.id !== req.params.id);
  writeDb(db);
  res.json({ success: true });
});

app.post('/api/settings', requireAuth, (req, res) => {
  const db = readDb();
  db.settings = req.body;
  writeDb(db);
  res.json({ success: true });
});

app.post('/api/catalog', requireAuth, (req, res) => {
  const db = readDb();
  db.catalog = req.body;
  writeDb(db);
  res.json({ success: true });
});

app.post('/api/parquet', requireAuth, (req, res) => {
  const db = readDb();
  db.parquetCatalog = req.body;
  writeDb(db);
  res.json({ success: true });
});

app.post('/api/categories', requireAuth, (req, res) => {
  const db = readDb();
  db.categories = req.body;
  writeDb(db);
  res.json({ success: true });
});

// Serve frontend static files
app.use(express.static(path.join(__dirname, 'dist')));

// Fallback to index.html for React routing
app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Egefleks Yer Kaplamaları sunucusu yerel ağda başlatıldı: http://localhost:${PORT}`);
  console.log(`Diğer bilgisayarlar yerel IP adresinizi kullanarak bağlanabilir (örn: http://192.168.1.XX:${PORT})`);
});
