import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../App.jsx';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Common UI State
  const [shops, setShops] = useState([]);
  const [users, setUsers] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modals & Forms State
  const [showShopModal, setShowShopModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showRentModal, setShowRentModal] = useState(false);
  
  const [newShopName, setNewShopName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState('TENANT');
  
  const [selectedShop, setSelectedShop] = useState(null);
  const [selectedTenantId, setSelectedTenantId] = useState('');

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      if (user.role === 'ADMIN') {
        // Fetch all shops and users
        const [shopsRes, usersRes] = await Promise.all([
          fetch('/api/admin/shops').then(r => {
            if (!r.ok) throw new Error('Không thể tải sạp hàng.');
            return r.json();
          }),
          fetch('/api/admin/users').then(r => {
            if (!r.ok) throw new Error('Không thể tải danh sách tài khoản.');
            return r.json();
          })
        ]);
        setShops(shopsRes);
        setUsers(usersRes);
      } else if (user.role === 'RESELLER') {
        // Fetch available shops, managed shops, and tenant list
        const [availRes, managedRes, tenantsRes] = await Promise.all([
          fetch('/api/reseller/shops/available').then(r => {
            if (!r.ok) throw new Error('Không thể tải sạp hàng trống.');
            return r.json();
          }),
          fetch('/api/reseller/shops/managed').then(r => {
            if (!r.ok) throw new Error('Không thể tải sạp hàng quản lý.');
            return r.json();
          }),
          fetch('/api/reseller/shops/tenants').then(r => {
            if (!r.ok) throw new Error('Không thể tải danh sách Tenant.');
            return r.json();
          })
        ]);
        
        // Combine them so that filters in table rows (e.g. s.status === 'AVAILABLE') continue to work
        setShops([...availRes, ...managedRes]);
        setTenants(tenantsRes);
      } else if (user.role === 'TENANT') {
        // Fetch only tenant's rented shops
        const rentedRes = await fetch('/api/tenant/shops').then(r => {
          if (!r.ok) throw new Error('Không thể tải sạp hàng đã thuê.');
          return r.json();
        });
        setShops(rentedRes);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Không thể tải dữ liệu. Vui lòng kiểm tra lại cấu hình API.');
    } finally {
      setLoading(false);
    }
  };

  // ADMIN actions
  const handleCreateShop = async (e) => {
    e.preventDefault();
    if (!newShopName.trim()) return;
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/admin/shops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shopName: newShopName })
      });
      if (res.ok) {
        setSuccess('Tạo sạp hàng mới thành công!');
        setNewShopName('');
        setShowShopModal(false);
        fetchData();
      } else {
        setError('Tạo sạp hàng thất bại.');
      }
    } catch (err) {
      setError('Đã xảy ra lỗi hệ thống.');
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newUsername.trim() || !newPassword.trim()) return;
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: newUsername, password: newPassword, role: newUserRole })
      });
      if (res.ok) {
        setSuccess('Tạo người dùng mới thành công!');
        setNewUsername('');
        setNewPassword('');
        setShowUserModal(false);
        fetchData();
      } else {
        const text = await res.text();
        setError(text || 'Tạo người dùng thất bại.');
      }
    } catch (err) {
      setError('Đã xảy ra lỗi hệ thống.');
    }
  };

  // RESELLER actions
  const handleClaimShop = async (shopId) => {
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`/api/reseller/shops/assign/${shopId}`, {
        method: 'POST'
      });
      const text = await res.text();
      if (res.ok) {
        setSuccess(text || 'Nhận quản lý sạp hàng thành công!');
        fetchData();
      } else {
        setError(text || 'Nhận quản lý thất bại.');
      }
    } catch (err) {
      setError('Đã xảy ra lỗi hệ thống.');
    }
  };

  const handleRentShop = async (e) => {
    e.preventDefault();
    if (!selectedShop || !selectedTenantId) return;
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`/api/reseller/shops/rent/${selectedShop.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ tenantId: selectedTenantId })
      });
      const text = await res.text();
      if (res.ok) {
        setSuccess(text || 'Cho thuê sạp hàng thành công!');
        setShowRentModal(false);
        setSelectedShop(null);
        setSelectedTenantId('');
        fetchData();
      } else {
        setError(text || 'Cho thuê thất bại.');
      }
    } catch (err) {
      setError('Đã xảy ra lỗi hệ thống.');
    }
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="navbar">
        <div className="nav-brand">
          <svg viewBox="0 0 24 24">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
          MALL MANAGEMENT
        </div>
        <div className="nav-actions">
          <div className="user-badge">
            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{user.username}</span>
            <span className={`role-tag ${user.role.toLowerCase()}`}>{user.role}</span>
          </div>
          <button onClick={logout} className="btn btn-secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>
            Đăng Xuất
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ padding: '2rem', flex: 1, maxWidth: '1400px', width: '100%', margin: '0 auto' }}>
        {/* Status Alerts */}
        {error && (
          <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: 'var(--color-danger)', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between' }}>
            <span>{error}</span>
            <button onClick={() => setError('')} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontWeight: 'bold' }}>×</button>
          </div>
        )}
        {success && (
          <div style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: 'var(--color-success)', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between' }}>
            <span>{success}</span>
            <button onClick={() => setSuccess('')} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontWeight: 'bold' }}>×</button>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>Đang tải dữ liệu hệ thống...</div>
        ) : (
          <>
            {/* ADMIN UI */}
            {user.role === 'ADMIN' && (
              <div>
                {/* Stats */}
                <div className="dashboard-grid">
                  <div className="glass-panel stat-card">
                    <span className="stat-value">{users.length}</span>
                    <span className="stat-label">Tổng người dùng</span>
                  </div>
                  <div className="glass-panel stat-card">
                    <span className="stat-value">{shops.length}</span>
                    <span className="stat-label">Tổng số sạp hàng</span>
                  </div>
                  <div className="glass-panel stat-card success">
                    <span className="stat-value">{shops.filter(s => s.status === 'AVAILABLE').length}</span>
                    <span className="stat-label">Sạp hàng đang trống</span>
                  </div>
                  <div className="glass-panel stat-card danger">
                    <span className="stat-value">{shops.filter(s => s.status === 'RENTED').length}</span>
                    <span className="stat-label">Sạp hàng đã cho thuê</span>
                  </div>
                </div>

                {/* Section header */}
                <div className="section-header">
                  <h2>Danh sách Sạp Hàng</h2>
                  <button onClick={() => setShowShopModal(true)} className="btn btn-primary">
                    + Thêm Sạp Hàng
                  </button>
                </div>

                {/* Shops list */}
                <div className="glass-panel table-container" style={{ marginBottom: '2.5rem' }}>
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Tên Sạp</th>
                        <th>Trạng Thái</th>
                        <th>Người Quản Lý (Reseller)</th>
                        <th>Người Thuê (Tenant)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {shops.length === 0 ? (
                        <tr>
                          <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Chưa có sạp hàng nào</td>
                        </tr>
                      ) : (
                        shops.map(s => (
                          <tr key={s.id}>
                            <td>#{s.id}</td>
                            <td style={{ fontWeight: 600 }}>{s.shopName}</td>
                            <td>
                              <span className={`badge-status ${s.status.toLowerCase()}`}>
                                {s.status === 'AVAILABLE' ? 'Đang Trống' : s.status === 'MANAGED' ? 'Đã Nhận' : 'Đang Thuê'}
                              </span>
                            </td>
                            <td>{s.reseller ? s.reseller.username : <span style={{ color: 'var(--text-muted)' }}>Chưa có</span>}</td>
                            <td>{s.tenant ? s.tenant.username : <span style={{ color: 'var(--text-muted)' }}>Chưa có</span>}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Users section */}
                <div className="section-header">
                  <h2>Quản lý Tài Khoản</h2>
                  <button onClick={() => setShowUserModal(true)} className="btn btn-primary">
                    + Tạo Tài Khoản
                  </button>
                </div>

                {/* Users list */}
                <div className="glass-panel table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Tên Đăng Nhập</th>
                        <th>Vai Trò (Role)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(u => (
                        <tr key={u.id}>
                          <td>#{u.id}</td>
                          <td style={{ fontWeight: 600 }}>{u.username}</td>
                          <td>
                            <span className={`role-tag ${u.role.toLowerCase()}`}>{u.role}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* RESELLER UI */}
            {user.role === 'RESELLER' && (
              <div>
                {/* Stats */}
                <div className="dashboard-grid">
                  <div className="glass-panel stat-card">
                    <span className="stat-value">{shops.filter(s => s.status === 'AVAILABLE').length}</span>
                    <span className="stat-label">Sạp hàng còn trống</span>
                  </div>
                  <div className="glass-panel stat-card success">
                    <span className="stat-value">{shops.filter(s => s.reseller?.id === user.id).length}</span>
                    <span className="stat-label">Sạp tôi đang quản lý</span>
                  </div>
                  <div className="glass-panel stat-card danger">
                    <span className="stat-value">{shops.filter(s => s.reseller?.id === user.id && s.status === 'RENTED').length}</span>
                    <span className="stat-label">Sạp tôi đã cho thuê</span>
                  </div>
                </div>

                {/* Rented / Managed shops */}
                <div className="section-header">
                  <h2>Sạp Hàng Tôi Quản Lý</h2>
                </div>

                <div className="glass-panel table-container" style={{ marginBottom: '2.5rem' }}>
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Tên Sạp</th>
                        <th>Trạng Thái</th>
                        <th>Khách Thuê (Tenant)</th>
                        <th>Hành Động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {shops.filter(s => s.reseller?.id === user.id).length === 0 ? (
                        <tr>
                          <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Bạn chưa quản lý sạp hàng nào. Hãy nhận sạp bên dưới.</td>
                        </tr>
                      ) : (
                        shops.filter(s => s.reseller?.id === user.id).map(s => (
                          <tr key={s.id}>
                            <td>#{s.id}</td>
                            <td style={{ fontWeight: 600 }}>{s.shopName}</td>
                            <td>
                              <span className={`badge-status ${s.status.toLowerCase()}`}>
                                {s.status === 'MANAGED' ? 'Đã Nhận' : 'Đang Thuê'}
                              </span>
                            </td>
                            <td>{s.tenant ? s.tenant.username : <span style={{ color: 'var(--text-muted)' }}>Chưa có người thuê</span>}</td>
                            <td>
                              {s.status === 'MANAGED' && (
                                <button 
                                  onClick={() => { setSelectedShop(s); setShowRentModal(true); }}
                                  className="btn btn-success" 
                                  style={{ padding: '0.35rem 0.8rem', fontSize: '0.85rem' }}
                                >
                                  Cho Thuê
                                </button>
                              )}
                              {s.status === 'RENTED' && (
                                <button 
                                  onClick={() => window.open(`/shop/${s.id}`, '_blank')}
                                  className="btn btn-secondary" 
                                  style={{ padding: '0.35rem 0.8rem', fontSize: '0.85rem' }}
                                >
                                  Xem Web Shop
                                </button>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Claim shops */}
                <div className="section-header">
                  <h2>Sạp Hàng Trống Trong Trung Tâm Thương Mại</h2>
                </div>

                <div className="glass-panel table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Tên Sạp</th>
                        <th>Trạng Thái</th>
                        <th>Hành Động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {shops.filter(s => s.status === 'AVAILABLE').length === 0 ? (
                        <tr>
                          <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Không còn sạp trống nào trong hệ thống</td>
                        </tr>
                      ) : (
                        shops.filter(s => s.status === 'AVAILABLE').map(s => (
                          <tr key={s.id}>
                            <td>#{s.id}</td>
                            <td style={{ fontWeight: 600 }}>{s.shopName}</td>
                            <td>
                              <span className="badge-status available">Đang Trống</span>
                            </td>
                            <td>
                              <button 
                                onClick={() => handleClaimShop(s.id)}
                                className="btn btn-primary"
                                style={{ padding: '0.35rem 0.8rem', fontSize: '0.85rem' }}
                              >
                                Nhận Quản Lý
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TENANT UI */}
            {user.role === 'TENANT' && (
              <div>
                <div className="section-header">
                  <h2>Sạp Hàng Tôi Đang Thuê</h2>
                </div>

                <div className="glass-panel table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Tên Sạp</th>
                        <th>Người Quản Lý (Reseller)</th>
                        <th>Website Cửa Hàng</th>
                        <th>Thiết Kế</th>
                        <th>Hỗ Trợ Khách Hàng</th>
                      </tr>
                    </thead>
                    <tbody>
                      {shops.length === 0 ? (
                        <tr>
                          <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Bạn chưa thuê sạp hàng nào. Liên hệ Reseller để thuê sạp.</td>
                        </tr>
                      ) : (
                        shops.map(s => (
                          <tr key={s.id}>
                            <td>#{s.id}</td>
                            <td style={{ fontWeight: 600 }}>{s.shopName}</td>
                            <td>{s.reseller ? s.reseller.username : 'Hệ thống'}</td>
                            <td>
                              <button 
                                onClick={() => window.open(`/shop/${s.id}`, '_blank')}
                                className="btn btn-secondary" 
                                style={{ padding: '0.35rem 0.8rem', fontSize: '0.85rem' }}
                              >
                                Xem Website
                              </button>
                            </td>
                            <td>
                              <button 
                                onClick={() => navigate(`/tenant/editor/${s.id}`)}
                                className="btn btn-primary"
                                style={{ padding: '0.35rem 0.8rem', fontSize: '0.85rem' }}
                              >
                                Thiết Kế Web
                              </button>
                            </td>
                            <td>
                              <button 
                                onClick={() => navigate(`/tenant/chat/${s.id}`)}
                                className="btn"
                                style={{ padding: '0.35rem 0.8rem', fontSize: '0.85rem', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 600, cursor: 'pointer' }}
                              >
                                Tin Nhắn Chat
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Add Shop Modal */}
      {showShopModal && (
        <div className="modal-overlay">
          <div className="glass-panel modal-content">
            <div className="modal-header">
              <h3>Tạo Sạp Hàng Mới</h3>
              <button className="modal-close" onClick={() => setShowShopModal(false)}>×</button>
            </div>
            <form onSubmit={handleCreateShop}>
              <div className="form-group">
                <label>Tên Sạp Hàng</label>
                <input 
                  type="text" 
                  placeholder="Ví dụ: Sạp Quần Áo A3" 
                  value={newShopName}
                  onChange={(e) => setNewShopName(e.target.value)}
                  required 
                />
              </div>
              <div className="modal-footer" style={{ marginTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowShopModal(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary">Lưu Lại</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showUserModal && (
        <div className="modal-overlay">
          <div className="glass-panel modal-content">
            <div className="modal-header">
              <h3>Tạo Tài Khoản Mới</h3>
              <button className="modal-close" onClick={() => setShowUserModal(false)}>×</button>
            </div>
            <form onSubmit={handleCreateUser}>
              <div className="form-group">
                <label>Tên Đăng Nhập</label>
                <input 
                  type="text" 
                  placeholder="Nhập tên tài khoản..." 
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  required 
                />
              </div>
              <div className="form-group">
                <label>Mật Khẩu</label>
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required 
                />
              </div>
              <div className="form-group">
                <label>Vai Trò (Role)</label>
                <select 
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value)}
                >
                  <option value="ADMIN">ADMIN</option>
                  <option value="RESELLER">RESELLER (Quản lý sạp)</option>
                  <option value="TENANT">TENANT (Khách thuê sạp)</option>
                </select>
              </div>
              <div className="modal-footer" style={{ marginTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowUserModal(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary">Tạo Tài Khoản</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rent Shop Modal */}
      {showRentModal && (
        <div className="modal-overlay">
          <div className="glass-panel modal-content">
            <div className="modal-header">
              <h3>Cho Thuê Sạp: {selectedShop?.shopName}</h3>
              <button className="modal-close" onClick={() => { setShowRentModal(false); setSelectedShop(null); }}>×</button>
            </div>
            <form onSubmit={handleRentShop}>
              <div className="form-group">
                <label>Chọn Khách Thuê (Tenant)</label>
                <select 
                  value={selectedTenantId}
                  onChange={(e) => setSelectedTenantId(e.target.value)}
                  required
                >
                  <option value="">-- Chọn một Tenant --</option>
                  {tenants.map(t => (
                    <option key={t.id} value={t.id}>{t.username}</option>
                  ))}
                </select>
              </div>
              <div className="modal-footer" style={{ marginTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => { setShowRentModal(false); setSelectedShop(null); }}>Hủy</button>
                <button type="submit" className="btn btn-success">Xác Nhận Cho Thuê</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}