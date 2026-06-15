import { useState, useEffect, useCallback } from 'react';
import Dashboard from './components/Dashboard';
import ContractForm from './components/ContractForm';
import ContractPrint from './components/ContractPrint';
import Settings from './components/Settings';
import Calculator from './components/Calculator';
import Products from './components/Products';
import Login from './components/Login';
import { Storage } from './utils/storage';
import { 
  Settings as SettingsIcon, 
  LayoutDashboard, 
  PlusCircle, 
  Sun, 
  Moon,
  Info,
  Calculator as CalculatorIcon,
  Package,
  LogOut
} from 'lucide-react';

function App() {
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard', 'create-contract', 'edit-contract', 'print-contract', 'settings', 'calculator'
  const [selectedContract, setSelectedContract] = useState(null);
  const [prefillData, setPrefillData] = useState(null);
  const [theme, setTheme] = useState('light');
  const [syncVersion, setSyncVersion] = useState(0);
  const [authToken, setAuthToken] = useState(() => localStorage.getItem('egefleks_auth_token') || null);
  const settings = Storage.getSettings();

  // Load and apply theme on launch
  useEffect(() => {
    const savedTheme = localStorage.getItem('egefleks_theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  // Logout handler
  const handleLogout = useCallback(async () => {
    const token = localStorage.getItem('egefleks_auth_token');
    try {
      await fetch('/api/logout', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
    } catch {
      // ignore network errors on logout
    }
    localStorage.removeItem('egefleks_auth_token');
    setAuthToken(null);
  }, []);

  // Sync with central Node.js database
  const syncWithServer = useCallback(async () => {
    // Avoid syncing during active contract editing to prevent input disruption
    if (currentView === 'create-contract' || currentView === 'edit-contract') {
      return;
    }

    const token = localStorage.getItem('egefleks_auth_token');
    if (!token) return;

    try {
      const res = await fetch('/api/db', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.status === 401) {
        // Token expired or invalid — force logout
        handleLogout();
        return;
      }
      if (!res.ok) return;
      const serverDb = await res.json();

      let changed = false;
      const localKeys = {
        contracts: 'egefleks_contracts',
        catalog: 'egefleks_catalog',
        settings: 'egefleks_settings',
        parquetCatalog: 'egefleks_parquet_catalog',
        categories: 'egefleks_categories',
      };

      Object.entries(localKeys).forEach(([dbKey, storageKey]) => {
        const localStr = localStorage.getItem(storageKey) || '';
        const serverStr = JSON.stringify(serverDb[dbKey]);

        let parsedLocal = null;
        try {
          parsedLocal = JSON.parse(localStr);
        } catch {
          // ignore
        }

        if (JSON.stringify(parsedLocal) !== serverStr) {
          localStorage.setItem(storageKey, serverStr);
          changed = true;
        }
      });

      if (changed) {
        setSyncVersion(prev => prev + 1);
      }
    } catch (err) {
      console.error('Lokal veri senkronizasyon hatası:', err);
    }
  }, [currentView, handleLogout]);

  useEffect(() => {
    syncWithServer();
    const interval = setInterval(syncWithServer, 5000);
    return () => clearInterval(interval);
  }, [syncWithServer]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('egefleks_theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const handleEditContract = (contract) => {
    setSelectedContract(contract);
    setCurrentView('edit-contract');
  };

  const handleViewPrint = (contractId) => {
    setSelectedContract(contractId);
    setCurrentView('print-contract');
  };

  const handlePrefillContract = (data) => {
    setPrefillData(data);
    setCurrentView('create-contract');
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard 
            onCreateNew={() => {
              setPrefillData(null);
              setCurrentView('create-contract');
            }} 
            onEdit={handleEditContract}
            onViewPrint={handleViewPrint}
            key={syncVersion}
          />
        );
      case 'create-contract':
        return (
          <ContractForm 
            contract={null} 
            prefillData={prefillData}
            onBack={() => {
              setPrefillData(null);
              setCurrentView('dashboard');
            }} 
          />
        );
      case 'edit-contract':
        return (
          <ContractForm 
            contract={selectedContract} 
            prefillData={null}
            onBack={() => setCurrentView('dashboard')} 
          />
        );
      case 'print-contract':
        return (
          <ContractPrint 
            contractId={selectedContract} 
            onBack={() => setCurrentView('dashboard')} 
            key={syncVersion}
          />
        );
      case 'settings':
        return (
          <Settings 
            onBack={() => setCurrentView('dashboard')} 
            key={syncVersion}
          />
        );
      case 'calculator':
        return (
          <Calculator 
            onPrefillContract={handlePrefillContract}
            key={syncVersion}
          />
        );
      case 'products':
        return (
          <Products 
            key={syncVersion}
          />
        );
      default:
        return <Dashboard onCreateNew={() => setCurrentView('create-contract')} key={syncVersion} />;
    }
  };

  const getViewTitle = () => {
    switch (currentView) {
      case 'dashboard':
        return 'Sözleşme Takip Paneli';
      case 'create-contract':
        return 'Yeni Sözleşme Oluştur';
      case 'edit-contract':
        return 'Sözleşme Düzenle';
      case 'print-contract':
        return 'Sözleşme Detayı & Yazdır';
      case 'settings':
        return 'Sistem Ayarları';
      case 'calculator':
        return 'Fiyat & Teklif Hesaplama';
      case 'products':
        return 'Ürün Kataloğu Yönetimi';
      default:
        return 'Egefleks Yer Kaplamaları';
    }
  };

  // Show login screen if not authenticated
  if (!authToken) {
    return <Login onLoginSuccess={(token) => setAuthToken(token)} />;
  }

  return (
    <div className="app-container">
      {/* Sidebar - hidden automatically in printing layout */}
      <aside className="sidebar no-print">
        <div className="sidebar-brand">
          <div className="sidebar-logo">e</div>
          <div>
            <div className="sidebar-brand-text">egefleks</div>
            <div style={{ fontSize: '9px', textTransform: 'uppercase', color: 'var(--primary)', letterSpacing: '1px', fontWeight: '800' }}>
              Zemin Sistemleri
            </div>
          </div>
        </div>

        <ul className="sidebar-menu">
          <li 
            className={`sidebar-item ${currentView === 'dashboard' ? 'active' : ''}`}
            onClick={() => {
              setSelectedContract(null);
              setCurrentView('dashboard');
            }}
          >
            <LayoutDashboard />
            Sözleşme Listesi
          </li>

          <li 
            className={`sidebar-item ${currentView === 'create-contract' ? 'active' : ''}`}
            onClick={() => {
              setSelectedContract(null);
              setCurrentView('create-contract');
            }}
          >
            <PlusCircle />
            Yeni Sözleşme
          </li>

          <li 
            className={`sidebar-item ${currentView === 'calculator' ? 'active' : ''}`}
            onClick={() => {
              setSelectedContract(null);
              setCurrentView('calculator');
            }}
          >
            <CalculatorIcon />
            Fiyat Hesaplama
          </li>

          <li 
            className={`sidebar-item ${currentView === 'products' ? 'active' : ''}`}
            onClick={() => {
              setSelectedContract(null);
              setCurrentView('products');
            }}
          >
            <Package />
            Ürünler
          </li>

          <li 
            className={`sidebar-item ${currentView === 'settings' ? 'active' : ''}`}
            onClick={() => {
              setSelectedContract(null);
              setCurrentView('settings');
            }}
          >
            <SettingsIcon />
            Ayarlar
          </li>
        </ul>

        <div className="sidebar-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <Info size={12} />
            <span>Mağaza: {settings.storeName}</span>
          </div>
          <span style={{ display: 'block', marginBottom: '12px' }}>v1.0.0 © 2026</span>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              width: '100%',
              padding: '8px 10px',
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: '8px',
              color: '#fca5a5',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              fontFamily: 'inherit'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.22)';
              e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.4)';
              e.currentTarget.style.color = '#ffffff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.12)';
              e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.2)';
              e.currentTarget.style.color = '#fca5a5';
            }}
          >
            <LogOut size={14} />
            Güvenli Çıkış
          </button>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="main-content">
        {/* Header Bar - hidden on print */}
        <header className="header-bar no-print">
          <h1 className="header-title">{getViewTitle()}</h1>
          
          <div className="header-actions">
            <button className="theme-toggle" onClick={toggleTheme} title="Tema Değiştir">
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            <div style={{ borderLeft: '1px solid var(--border)', height: '24px' }}></div>
            <span style={{ fontSize: '14px', fontWeight: '600' }}>Yönetici</span>
          </div>
        </header>

        {/* Dynamic page render */}
        <div className="content-body">
          {renderView()}
        </div>
      </main>
    </div>
  );
}

export default App;
