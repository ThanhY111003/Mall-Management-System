import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../App.jsx';
import { authFetch } from '../../../utils/csrf.js';

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
  
  const [showEditShopModal, setShowEditShopModal] = useState(false);
  const [editingShop, setEditingShop] = useState(null);
  const [editShopName, setEditShopName] = useState('');

  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editUsername, setEditUsername] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editUserRole, setEditUserRole] = useState('TENANT');
  
  const [selectedShop, setSelectedShop] = useState(null);
  const [selectedTenantId, setSelectedTenantId] = useState('');

  // Orders Management States
  const [showOrdersModal, setShowOrdersModal] = useState(false);
  const [orders, setOrders] = useState([]);
  const [selectedOrdersShop, setSelectedOrdersShop] = useState(null);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [notifications, setNotifications] = useState({});

  useEffect(() => {
    fetchData();
  }, [user]);

  // Poll notifications for Tenant role
  useEffect(() => {
    if (!user || user.role !== 'TENANT') return;
    const fetchNotifications = async () => {
      try {
        const res = await fetch('/api/tenant/shops/notifications');
        if (res.ok) {
          const data = await res.json();
          setNotifications(data);
        }
      } catch (err) {
        console.error('Không thể tải thông báo:', err);
      }
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
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
      const res = await authFetch('/api/admin/shops', {
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
  const openEditShopModal = (shop) => {
    setEditingShop(shop);
    setEditShopName(shop.shopName);
    setShowEditShopModal(true);
  };

  const handleEditShop = async (e) => {
    e.preventDefault();
    if (!editShopName.trim()) {
      setError('Tên sạp hàng không được trống!');
      return;
    }
    setError('');
    setSuccess('');
    try {
      const res = await authFetch(`/api/admin/shops/${editingShop.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shopName: editShopName }),
      });
      if (!res.ok) {
        throw new Error(await res.text() || 'Cập nhật sạp hàng thất bại.');
      }
      setSuccess('Cập nhật sạp hàng thành công!');
      setShowEditShopModal(false);
      setEditingShop(null);
      setEditShopName('');
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteShop = async (shopId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa sạp hàng này?')) return;
    setError('');
    setSuccess('');
    try {
      const res = await authFetch(`/api/admin/shops/${shopId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        throw new Error(await res.text() || 'Xóa sạp hàng thất bại.');
      }
      setSuccess('Xóa sạp hàng thành công!');
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };
  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newUsername.trim() || !newPassword.trim()) return;
    setError('');
    setSuccess('');
    try {
      const res = await authFetch('/api/admin/users', {
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
  const openEditUserModal = (userToEdit) => {
    setEditingUser(userToEdit);
    setEditUsername(userToEdit.username);
    setEditPassword('');
    setEditUserRole(userToEdit.role);
    setShowEditUserModal(true);
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    if (!editUsername.trim()) {
      setError('Tên đăng nhập không được trống!');
      return;
    }
    setError('');
    setSuccess('');
    try {
      const payload = {
        username: editUsername,
        role: editUserRole,
      };
      if (editPassword.trim()) {
        payload.password = editPassword;
      }
      const res = await authFetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        throw new Error(await res.text() || 'Cập nhật tài khoản thất bại.');
      }
      setSuccess('Cập nhật tài khoản thành công!');
      setShowEditUserModal(false);
      setEditingUser(null);
      setEditUsername('');
      setEditPassword('');
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa tài khoản này? Toàn bộ các sạp liên kết của tài khoản sẽ được trả về trạng thái trống.')) return;
    setError('');
    setSuccess('');
    try {
      const res = await authFetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        throw new Error(await res.text() || 'Xóa tài khoản thất bại.');
      }
      setSuccess('Xóa tài khoản thành công!');
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };
  // RESELLER actions
  const handleClaimShop = async (shopId) => {
    setError('');
    setSuccess('');
    try {
      const res = await authFetch(`/api/reseller/shops/assign/${shopId}`, {
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
      const res = await authFetch(`/api/reseller/shops/rent/${selectedShop.id}`, {
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

  const handleOpenOrdersModal = async (shop) => {
    setSelectedOrdersShop(shop);
    setShowOrdersModal(true);
    setLoadingOrders(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`/api/tenant/orders/${shop.id}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      } else {
        const text = await res.text();
        setError(text || "Không thể tải danh sách đơn hàng.");
      }
    } catch (err) {
      console.error(err);
      setError("Lỗi kết nối khi tải đơn hàng.");
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId, status) => {
    setError('');
    setSuccess('');
    try {
      const res = await authFetch(`/api/tenant/orders/update-status/${orderId}?status=${status}`, {
        method: 'POST'
      });
      if (res.ok) {
        setSuccess(`Cập nhật trạng thái đơn hàng #${orderId} thành công!`);
        // Refresh local orders list
        if (selectedOrdersShop) {
          const freshRes = await fetch(`/api/tenant/orders/${selectedOrdersShop.id}`);
          if (freshRes.ok) {
            const data = await freshRes.json();
            setOrders(data);
          }
        }
      } else {
        const text = await res.text();
        setError(text || "Cập nhật thất bại.");
      }
    } catch (err) {
      console.error(err);
      setError("Lỗi kết nối khi cập nhật đơn hàng.");
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
                        <th>Hành Động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {shops.length === 0 ? (
                        <tr>
                          <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Chưa có sạp hàng nào</td>
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
                            <td>
                              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <button onClick={() => openEditShopModal(s)} className="btn btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}>Sửa</button>
                                {s.reseller === null && s.tenant === null ? (
                                  <button onClick={() => handleDeleteShop(s.id)} className="btn btn-danger" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}>Xóa</button>
                                ) : (
                                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>(Không được xóa)</span>
                                )}
                              </div>
                            </td>
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
                        <th>Hành Động</th>
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
                          <td>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              <button onClick={() => openEditUserModal(u)} className="btn btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}>Sửa</button>
                              {u.username !== user.username ? (
                                <button onClick={() => handleDeleteUser(u.id)} className="btn btn-danger" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}>Xóa</button>
                              ) : (
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>(Tài khoản của bạn)</span>
                              )}
                            </div>
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
                        <th>Sản Phẩm</th>
                        <th>Đơn Hàng & Đặt Bàn</th>
                        <th>Hỗ Trợ Khách Hàng</th>
                      </tr>
                    </thead>
                    <tbody>
                      {shops.length === 0 ? (
                        <tr>
                          <td colSpan="8" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Bạn chưa thuê sạp hàng nào. Liên hệ Reseller để thuê sạp.</td>
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
                                onClick={() => navigate(`/tenant/products/${s.id}`)}
                                className="btn"
                                style={{ padding: '0.35rem 0.8rem', fontSize: '0.85rem', background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 600, cursor: 'pointer' }}
                              >
                                Sản Phẩm
                              </button>
                            </td>
                            <td>
                              <button 
                                onClick={() => handleOpenOrdersModal(s)}
                                className="btn"
                                style={{ position: 'relative', padding: '0.35rem 0.8rem', fontSize: '0.85rem', background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 600, cursor: 'pointer' }}
                              >
                                Xem Đơn Hàng
                                {notifications[s.id]?.pendingOrders > 0 && (
                                  <span style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#ef4444', color: 'white', borderRadius: '50%', padding: '2px 6px', fontSize: '0.7rem', fontWeight: 'bold', boxShadow: '0 2px 5px rgba(0,0,0,0.3)' }}>
                                    {notifications[s.id].pendingOrders}
                                  </span>
                                )}
                              </button>
                            </td>
                            <td>
                              <button 
                                onClick={() => navigate(`/tenant/chat/${s.id}`)}
                                className="btn"
                                style={{ position: 'relative', padding: '0.35rem 0.8rem', fontSize: '0.85rem', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 600, cursor: 'pointer' }}
                              >
                                Tin Nhắn Chat
                                {notifications[s.id]?.unreadChats > 0 && (
                                  <span style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#ef4444', color: 'white', borderRadius: '50%', padding: '2px 6px', fontSize: '0.7rem', fontWeight: 'bold', boxShadow: '0 2px 5px rgba(0,0,0,0.3)' }}>
                                    {notifications[s.id].unreadChats}
                                  </span>
                                )}
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>              </div>
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

      {/* Edit Shop Modal */}
      {showEditShopModal && (
        <div className="modal-overlay">
          <div className="glass-panel modal-content">
            <div className="modal-header">
              <h3>Sửa Tên Sạp Hàng</h3>
              <button className="modal-close" onClick={() => { setShowEditShopModal(false); setEditingShop(null); }}>×</button>
            </div>
            <form onSubmit={handleEditShop}>
              <div className="form-group">
                <label>Tên Sạp Hàng Mới</label>
                <input 
                  type="text" 
                  value={editShopName}
                  onChange={(e) => setEditShopName(e.target.value)}
                  required 
                />
              </div>
              <div className="modal-footer" style={{ marginTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => { setShowEditShopModal(false); setEditingShop(null); }}>Hủy</button>
                <button type="submit" className="btn btn-primary">Lưu Thay Đổi</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditUserModal && (
        <div className="modal-overlay">
          <div className="glass-panel modal-content">
            <div className="modal-header">
              <h3>Sửa Tài Khoản</h3>
              <button className="modal-close" onClick={() => { setShowEditUserModal(false); setEditingUser(null); }}>×</button>
            </div>
            <form onSubmit={handleEditUser}>
              <div className="form-group">
                <label>Tên Đăng Nhập</label>
                <input 
                  type="text" 
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  required 
                />
              </div>
              <div className="form-group">
                <label>Mật Khẩu Mới (Để trống nếu không đổi)</label>
                <input 
                  type="password" 
                  placeholder="••••••••"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Vai Trò (Role)</label>
                <select 
                  value={editUserRole}
                  onChange={(e) => setEditUserRole(e.target.value)}
                  style={{ background: '#1f2937', color: 'white', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '0.5rem', width: '100%' }}
                >
                  <option value="TENANT">Tenant (Thuê Sạp)</option>
                  <option value="RESELLER">Reseller (Nhận Quản Lý)</option>
                  <option value="ADMIN">Admin (Quản Trị Viên)</option>
                </select>
              </div>
              <div className="modal-footer" style={{ marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => { setShowEditUserModal(false); setEditingUser(null); }}>Hủy</button>
                <button type="submit" className="btn btn-primary">Lưu Thay Đổi</button>
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

      {/* Manage Orders Modal */}
      {showOrdersModal && (
        <div className="modal-overlay" onClick={() => { setShowOrdersModal(false); setSelectedOrdersShop(null); setOrders([]); }}>
          <div className="glass-panel modal-content" style={{ maxWidth: '950px', width: '100%', maxHeight: '85vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Quản lý Đơn hàng & Đặt bàn: {selectedOrdersShop?.shopName}</h3>
              <button className="modal-close" onClick={() => { setShowOrdersModal(false); setSelectedOrdersShop(null); setOrders([]); }}>×</button>
            </div>
            
            {loadingOrders ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>Đang tải danh sách đơn hàng...</div>
            ) : orders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Chưa có đơn hàng hoặc lịch đặt bàn nào.</div>
            ) : (
              <div className="table-container" style={{ marginTop: '1rem' }}>
                <table style={{ width: '100%' }}>
                  <thead>
                    <tr>
                      <th>Mã ĐH</th>
                      <th>Khách Hàng / SĐT</th>
                      <th>Loại</th>
                      <th>Chi Tiết Giao Nhận / Đặt Bàn</th>
                      <th>Nội Dung Chi Tiết (Sản Phẩm / Ghi Chú)</th>
                      <th>Tổng Tiền</th>
                      <th>Trạng Thái</th>
                      <th>Hành Động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(o => {
                      const isBooking = o.paymentMethod === 'BOOKING';
                      let parsedDetails = null;
                      try {
                        parsedDetails = JSON.parse(o.itemsJson);
                      } catch (e) {
                        parsedDetails = o.itemsJson;
                      }

                      return (
                        <tr key={o.id}>
                          <td>#{o.id}</td>
                          <td>
                            <div style={{ fontWeight: 600 }}>{o.customerName}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{o.customerPhone}</div>
                          </td>
                          <td>
                            <span style={{ 
                              padding: '0.2rem 0.5rem', 
                              borderRadius: '4px', 
                              fontSize: '0.75rem', 
                              fontWeight: 600,
                              background: isBooking ? 'rgba(230, 95, 43, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                              color: isBooking ? '#ff8c32' : '#10b981'
                            }}>
                              {isBooking ? 'ĐẶT BÀN' : 'MUA HÀNG'}
                            </span>
                          </td>
                          <td style={{ fontSize: '0.85rem', maxWidth: '200px', wordBreak: 'break-word' }}>
                            {o.customerAddress}
                          </td>
                          <td style={{ fontSize: '0.85rem', maxWidth: '250px' }}>
                            {isBooking ? (
                              <div>
                                {parsedDetails?.bookingNotes && (
                                  <div>Ghi chú: <i>{parsedDetails.bookingNotes}</i></div>
                                )}
                              </div>
                            ) : (
                              <div>
                                {Array.isArray(parsedDetails) && parsedDetails.map((item, idx) => (
                                  <div key={idx}>
                                    - {item.name} (x{item.quantity}) {item.size && `[Size: ${item.size}]`}
                                  </div>
                                ))}
                              </div>
                            )}
                          </td>
                          <td style={{ fontWeight: 600 }}>
                            {isBooking ? '-' : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(o.totalAmount)}
                          </td>
                          <td>
                            <span className={`badge-status ${o.status.toLowerCase()}`}>
                              {o.status === 'PENDING' ? 'Chờ duyệt' : o.status === 'CONFIRMED' ? 'Đã duyệt' : 'Đã hủy'}
                            </span>
                          </td>
                          <td>
                            {o.status === 'PENDING' && (
                              <div style={{ display: 'flex', gap: '4px' }}>
                                <button 
                                  onClick={() => handleUpdateOrderStatus(o.id, 'CONFIRMED')}
                                  className="btn btn-success" 
                                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                                >
                                  Duyệt
                                </button>
                                <button 
                                  onClick={() => handleUpdateOrderStatus(o.id, 'CANCELLED')}
                                  className="btn btn-secondary" 
                                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', backgroundColor: 'var(--color-danger)' }}
                                >
                                  Hủy
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
            )}
            
            <div className="modal-footer" style={{ marginTop: '1.5rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => { setShowOrdersModal(false); setSelectedOrdersShop(null); setOrders([]); }}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}