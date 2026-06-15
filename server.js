/* eslint-disable no-undef */
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { MongoClient } from 'mongodb';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'db.json');
const MONGODB_URI = process.env.MONGODB_URI;

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

// MongoDB Database Client and State
let mongoClient = null;
let mongoDb = null;
let isMongoConnected = false;

// Connect to MongoDB
async function connectToMongo() {
  if (!MONGODB_URI) {
    console.log('MONGODB_URI set edilmemiş. Local db.json modu aktif.');
    return false;
  }
  try {
    console.log('MongoDB Atlas\'a bağlanılıyor...');
    mongoClient = new MongoClient(MONGODB_URI);
    await mongoClient.connect();
    mongoDb = mongoClient.db();
    isMongoConnected = true;
    console.log('MongoDB Atlas bağlantısı başarılı! 🟢');

    // Run migration if MongoDB collections are empty and db.json exists
    await migrateLocalDataToMongo();
    return true;
  } catch (error) {
    console.error('MongoDB bağlantı hatası, local moda geçiliyor:', error);
    isMongoConnected = false;
    return false;
  }
}

// Data Migration from db.json to MongoDB
async function migrateLocalDataToMongo() {
  try {
    const contractsCount = await mongoDb.collection('contracts').countDocuments();
    // If we have no contracts in Mongo, check if db.json has data and migrate it
    if (contractsCount === 0 && fs.existsSync(DB_FILE)) {
      console.log('Mevcut local db.json verileri MongoDB\'ye aktarılıyor...');
      const localData = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));

      if (localData.settings) {
        await mongoDb.collection('settings').updateOne({}, { $set: localData.settings }, { upsert: true });
      }
      if (localData.categories) {
        await mongoDb.collection('categories').updateOne({}, { $set: { list: localData.categories } }, { upsert: true });
      }
      if (localData.catalog && localData.catalog.length > 0) {
        await mongoDb.collection('catalog').deleteMany({});
        await mongoDb.collection('catalog').insertMany(localData.catalog);
      }
      if (localData.parquetCatalog && localData.parquetCatalog.length > 0) {
        await mongoDb.collection('parquetCatalog').deleteMany({});
        await mongoDb.collection('parquetCatalog').insertMany(localData.parquetCatalog);
      }
      if (localData.contracts && localData.contracts.length > 0) {
        await mongoDb.collection('contracts').insertMany(localData.contracts);
      }
      console.log('Veri transferi başarıyla tamamlandı! 🚀');
    }
  } catch (err) {
    console.error('Veri transferi hatası:', err);
  }
}

// Local Database Handlers (Fallback)
const readLocalDb = () => {
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

const writeLocalDb = (data) => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Database write error:', err);
  }
};

// Unified Database CRUD Helper
async function getDbSnapshot() {
  if (isMongoConnected) {
    try {
      const settingsDoc = await mongoDb.collection('settings').findOne({});
      const categoriesDoc = await mongoDb.collection('categories').findOne({});
      const catalog = await mongoDb.collection('catalog').find({}).toArray();
      const parquetCatalog = await mongoDb.collection('parquetCatalog').find({}).toArray();
      const contracts = await mongoDb.collection('contracts').find({}).toArray();

      return {
        settings: settingsDoc || DEFAULT_SETTINGS,
        categories: categoriesDoc ? categoriesDoc.list : ['Sözleşme Kalemleri'],
        catalog: catalog.length > 0 ? catalog : DEFAULT_CATALOG,
        parquetCatalog: parquetCatalog.length > 0 ? parquetCatalog : DEFAULT_PARQUET_CATALOG.map((p, i) => ({ ...p, id: (i + 1).toString() })),
        contracts: contracts || []
      };
    } catch (err) {
      console.error('Error fetching MongoDB snapshot, falling back to local file read:', err);
    }
  }
  return readLocalDb();
}

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
app.get('/api/db', requireAuth, async (req, res) => {
  const db = await getDbSnapshot();
  res.json(db);
});

app.post('/api/contracts', requireAuth, async (req, res) => {
  const contract = req.body;
  if (!contract.id) {
    contract.id = Date.now().toString();
  }

  if (isMongoConnected) {
    try {
      if (!contract.contractNumber) {
        const contracts = await mongoDb.collection('contracts').find({}).toArray();
        const lastNumber = contracts.length > 0
          ? Math.max(...contracts.map(c => Number(c.contractNumber) || 1000))
          : 1000;
        contract.contractNumber = (lastNumber + 1).toString();
      }

      await mongoDb.collection('contracts').updateOne(
        { id: contract.id },
        { $set: contract },
        { upsert: true }
      );
      return res.json({ success: true, contract });
    } catch (err) {
      console.error('MongoDB contract update error, falling back to local file write:', err);
    }
  }

  // File fallback
  const db = readLocalDb();
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
  writeLocalDb(db);
  res.json({ success: true, contract });
});

app.delete('/api/contracts/:id', requireAuth, async (req, res) => {
  const id = req.params.id;
  if (isMongoConnected) {
    try {
      await mongoDb.collection('contracts').deleteOne({ id: id });
      return res.json({ success: true });
    } catch (err) {
      console.error('MongoDB contract delete error, falling back to local file:', err);
    }
  }

  const db = readLocalDb();
  db.contracts = db.contracts.filter(c => c.id !== id);
  writeLocalDb(db);
  res.json({ success: true });
});

app.post('/api/settings', requireAuth, async (req, res) => {
  const settings = req.body;
  if (isMongoConnected) {
    try {
      await mongoDb.collection('settings').updateOne({}, { $set: settings }, { upsert: true });
      return res.json({ success: true });
    } catch (err) {
      console.error('MongoDB settings update error, falling back to local file:', err);
    }
  }

  const db = readLocalDb();
  db.settings = settings;
  writeLocalDb(db);
  res.json({ success: true });
});

app.post('/api/catalog', requireAuth, async (req, res) => {
  const catalog = req.body;
  if (isMongoConnected) {
    try {
      await mongoDb.collection('catalog').deleteMany({});
      if (catalog.length > 0) {
        await mongoDb.collection('catalog').insertMany(catalog);
      }
      return res.json({ success: true });
    } catch (err) {
      console.error('MongoDB catalog update error, falling back to local file:', err);
    }
  }

  const db = readLocalDb();
  db.catalog = catalog;
  writeLocalDb(db);
  res.json({ success: true });
});

app.post('/api/parquet', requireAuth, async (req, res) => {
  const parquetCatalog = req.body;
  if (isMongoConnected) {
    try {
      await mongoDb.collection('parquetCatalog').deleteMany({});
      if (parquetCatalog.length > 0) {
        await mongoDb.collection('parquetCatalog').insertMany(parquetCatalog);
      }
      return res.json({ success: true });
    } catch (err) {
      console.error('MongoDB parquet update error, falling back to local file:', err);
    }
  }

  const db = readLocalDb();
  db.parquetCatalog = parquetCatalog;
  writeLocalDb(db);
  res.json({ success: true });
});

app.post('/api/categories', requireAuth, async (req, res) => {
  const categories = req.body;
  if (isMongoConnected) {
    try {
      await mongoDb.collection('categories').updateOne({}, { $set: { list: categories } }, { upsert: true });
      return res.json({ success: true });
    } catch (err) {
      console.error('MongoDB categories update error, falling back to local file:', err);
    }
  }

  const db = readLocalDb();
  db.categories = categories;
  writeLocalDb(db);
  res.json({ success: true });
});

// Serve frontend static files
app.use(express.static(path.join(__dirname, 'dist')));

// Fallback to index.html for React routing
app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Initialize database connection then start server
connectToMongo().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Egefleks Yer Kaplamaları sunucusu başlatıldı. Port: ${PORT}`);
    if (isMongoConnected) {
      console.log('Veriler bulutta MongoDB Atlas üzerinde saklanıyor.');
    } else {
      console.log(`Veriler yerelde saklanıyor (${DB_FILE}).`);
    }
  });
});

