import { useState, useEffect, useCallback } from 'react';
import { Storage } from '../utils/storage';
import { 
  FileText, 
  TrendingUp, 
  Clock, 
  Search, 
  Plus, 
  Printer, 
  Edit, 
  Trash2, 
  Calendar, 
  CreditCard,
  DollarSign
} from 'lucide-react';

export default function Dashboard({ onCreateNew, onEdit, onViewPrint }) {
  const [contracts, setContracts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('hepsi');
  const [metrics, setMetrics] = useState({
    totalSales: 0,
    collected: 0,
    remaining: 0,
    activeJobs: 0,
    completedJobs: 0
  });

  const calculateMetrics = useCallback((list) => {
    let sales = 0;
    let paid = 0;
    let rem = 0;
    let active = 0;
    let completed = 0;

    list.forEach(c => {
      sales += c.total || 0;
      paid += (c.cashPayment || 0) + (c.cardPayment || 0);
      rem += c.remaining || 0;
      
      if (c.status === 'tamamlandi') {
        completed += 1;
      } else {
        active += 1;
      }
    });

    setMetrics({
      totalSales: sales,
      collected: paid,
      remaining: rem,
      activeJobs: active,
      completedJobs: completed
    });
  }, []);

  const loadData = useCallback(() => {
    const data = Storage.getContracts();
    // Sort contracts by date descending
    const sorted = [...data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    setContracts(sorted);
    calculateMetrics(sorted);
  }, [calculateMetrics]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDelete = (id) => {
    if (window.confirm('Bu sözleşmeyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
      Storage.deleteContract(id);
      loadData();
    }
  };

  const handleStatusChange = (id, newStatus) => {
    Storage.updateContractStatus(id, newStatus);
    loadData();
  };

  const filteredContracts = contracts.filter(c => {
    const matchesSearch = 
      c.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone?.includes(searchTerm) ||
      c.contractNumber?.toString().includes(searchTerm);
    
    const matchesStatus = statusFilter === 'hepsi' || c.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(val);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  return (
    <div>
      {/* Metrics Section */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon-box primary">
            <TrendingUp />
          </div>
          <div className="metric-details">
            <h4>Toplam Ciro</h4>
            <div className="metric-value">{formatCurrency(metrics.totalSales)}</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box success">
            <DollarSign />
          </div>
          <div className="metric-details">
            <h4>Tahsil Edilen</h4>
            <div className="metric-value">{formatCurrency(metrics.collected)}</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box warning">
            <CreditCard />
          </div>
          <div className="metric-details">
            <h4>Kalan Alacak</h4>
            <div className="metric-value">{formatCurrency(metrics.remaining)}</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box primary">
            <Clock />
          </div>
          <div className="metric-details">
            <h4>Aktif Siparişler</h4>
            <div className="metric-value">{metrics.activeJobs} İş</div>
          </div>
        </div>
      </div>

      {/* Main Control Card */}
      <div className="card">
        <div className="search-filter-row">
          <div className="search-box">
            <Search />
            <input 
              type="text" 
              className="form-input" 
              placeholder="Müşteri adı, telefon veya sözleşme no ile ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <select 
              className="form-select" 
              style={{ width: '200px' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="hepsi">Tüm Durumlar</option>
              <option value="hazirlaniyor">Hazırlanıyor</option>
              <option value="odeme_bekliyor">Ödeme Bekliyor</option>
              <option value="teslimat_bekliyor">Teslimat Bekliyor</option>
              <option value="tamamlandi">Tamamlandı</option>
            </select>

            <button className="btn btn-primary" onClick={onCreateNew}>
              <Plus size={18} />
              Yeni Sözleşme
            </button>
          </div>
        </div>

        {/* Contracts Table */}
        <div className="data-table-wrapper">
          {filteredContracts.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <FileText size={48} style={{ marginBottom: '12px', opacity: 0.5 }} />
              <p>Bulunan kriterlere uygun sözleşme kaydı bulunamadı.</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Sözleşme No</th>
                  <th>Müşteri Bilgisi</th>
                  <th>Tarih</th>
                  <th>Teslim Tarihi</th>
                  <th>Toplam Tutar</th>
                  <th>Kalan Bakiye</th>
                  <th>Durum</th>
                  <th style={{ textAlign: 'right' }}>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {filteredContracts.map(c => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: '700' }}>#{c.contractNumber}</td>
                    <td>
                      <div style={{ fontWeight: '600' }}>{c.customerName}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{c.phone}</div>
                    </td>
                    <td>{formatDate(c.date)}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}>
                        <Calendar size={14} className="text-muted" />
                        {c.deliveryDate ? formatDate(c.deliveryDate) : 'Belirtilmedi'}
                      </div>
                    </td>
                    <td style={{ fontWeight: '600' }}>{formatCurrency(c.total)}</td>
                    <td style={{ fontWeight: '600', color: c.remaining > 0 ? 'var(--danger)' : 'var(--success)' }}>
                      {c.remaining > 0 ? formatCurrency(c.remaining) : 'Ödendi'}
                    </td>
                    <td>
                      <select
                        className={`badge badge-${c.status}`}
                        value={c.status}
                        onChange={(e) => handleStatusChange(c.id, e.target.value)}
                        style={{ border: 'none', cursor: 'pointer', outline: 'none', paddingRight: '8px' }}
                      >
                        <option value="hazirlaniyor">Hazırlanıyor</option>
                        <option value="odeme_bekliyor">Ödeme Bekliyor</option>
                        <option value="teslimat_bekliyor">Teslimat Bekliyor</option>
                        <option value="tamamlandi">Tamamlandı</option>
                      </select>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button 
                          className="btn-icon-only" 
                          title="Yazdır / PDF" 
                          onClick={() => onViewPrint(c.id)}
                        >
                          <Printer size={16} />
                        </button>
                        <button 
                          className="btn-icon-only" 
                          title="Düzenle" 
                          onClick={() => onEdit(c)}
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          className="btn-icon-only" 
                          title="Sil" 
                          style={{ color: 'var(--danger)' }}
                          onClick={() => handleDelete(c.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
