// src/components/pages/tenant/TenantProducts.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { authFetch } from '../../../utils/csrf.js';

export default function TenantProducts() {
  const { shopId } = useParams();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const emptyForm = { name: '', price: '', imageUrl: '', description: '', category: '', stock: '', active: true };
  const [form, setForm] = useState(emptyForm);

  const loadProducts = () => {
    setLoading(true);
    authFetch(`/api/tenant/products/${shopId}`)
      .then(res => { if (!res.ok) throw new Error('Không thể tải sản phẩm.'); return res.json(); })
      .then(setProducts)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(loadProducts, [shopId]);

  const openCreateModal = () => {
    setEditingProduct(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEditModal = (p) => {
    setEditingProduct(p);
    setForm({
      name: p.name, price: p.price, imageUrl: p.imageUrl || '',
      description: p.description || '', category: p.category || '',
      stock: p.stock ?? '', active: p.active,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const payload = {
      ...form,
      shopId: parseInt(shopId, 10),
      price: parseInt(form.price, 10),
      stock: form.stock === '' ? null : parseInt(form.stock, 10),
    };

    try {
      const url = editingProduct ? `/api/tenant/products/${editingProduct.id}` : '/api/tenant/products';
      const method = editingProduct ? 'PUT' : 'POST';
      const res = await authFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text() || 'Lưu sản phẩm thất bại.');
      setShowModal(false);
      loadProducts();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa sản phẩm này?')) return;
    try {
      const res = await authFetch(`/api/tenant/products/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Xóa thất bại.');
      loadProducts();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button onClick={() => navigate('/dashboard')} className="btn btn-secondary" style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}>
            ← Quay Lại
          </button>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Quản Lý Sản Phẩm — Shop #{shopId}</h2>
        </div>
        <button onClick={openCreateModal} className="btn btn-primary">+ Thêm Sản Phẩm</button>
      </div>

      {error && <div style={{ color: 'var(--color-danger)', marginBottom: '1rem' }}>{error}</div>}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>Đang tải...</div>
      ) : (
        <div className="glass-panel table-container">
          <table>
            <thead>
              <tr>
                <th>Ảnh</th><th>Tên</th><th>Giá</th><th>Danh Mục</th><th>Tồn Kho</th><th>Trạng Thái</th><th>Hành Động</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Chưa có sản phẩm nào.</td></tr>
              ) : products.map(p => (
                <tr key={p.id}>
                  <td>
                    {p.imageUrl ? <img src={p.imageUrl} alt={p.name} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 6 }} /> : '—'}
                  </td>
                  <td style={{ fontWeight: 600 }}>{p.name}</td>
                  <td>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.price)}</td>
                  <td>{p.category || '—'}</td>
                  <td>{p.stock ?? 'Không giới hạn'}</td>
                  <td>
                    <span className={`badge-status ${p.active ? 'available' : 'rented'}`}>
                      {p.active ? 'Đang bán' : 'Đã ẩn'}
                    </span>
                  </td>
                  <td style={{ display: 'flex', gap: '6px' }}>
                    <button onClick={() => openEditModal(p)} className="btn btn-secondary" style={{ padding: '0.3rem 0.7rem', fontSize: '0.8rem' }}>Sửa</button>
                    <button onClick={() => handleDelete(p.id)} className="btn btn-danger" style={{ padding: '0.3rem 0.7rem', fontSize: '0.8rem' }}>Xóa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="glass-panel modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingProduct ? 'Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Tên sản phẩm *</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label>Giá (VNĐ) *</label>
                  <input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Tồn kho (để trống = không giới hạn)</label>
                  <input type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label>URL Hình Ảnh</label>
                <input value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://..." />
              </div>
              <div className="form-group">
                <label>Danh Mục</label>
                <input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="VD: Giày, Món chính..." />
              </div>
              <div className="form-group">
                <label>Mô Tả</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} />
              </div>
              <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }}>
                <input type="checkbox" checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked })} style={{ width: 'auto' }} />
                <label style={{ margin: 0 }}>Hiển thị trên website</label>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary">Lưu</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
